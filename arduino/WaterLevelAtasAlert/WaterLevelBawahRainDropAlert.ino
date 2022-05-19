#include <WiFi.h>
#include <PubSubClient.h>

#include <NTPClient.h>
#include <WiFiUdp.h>

#define NTP_OFFSET   60 * 60      // In seconds
#define NTP_INTERVAL 60 * 1000    // In miliseconds
#define NTP_ADDRESS  "europe.pool.ntp.org"

WiFiClient espClient;
PubSubClient client(espClient);

WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, NTP_ADDRESS, NTP_OFFSET, NTP_INTERVAL);

// 1. WIFI CONFIG
const char* SSID = "Tselhome-2002D";
const char* SSID_PASSWORD = "RatuTayaInka999";

// 2. MQTT CLIENT CONFIG
char CLIENT[]= "app-Esp32ElectricalFloodSafetySystem";
char CLIENT_PASSWORD[]="0r2p9o9ttu7YpwLYiKXwJIb9SLjwKF";

// 3. MQTT BROKER CONFIG
const char* BROKER_SERVER = "202.148.1.57";
const int BROKER_PORT = 1883;

// 4. DEVICE
const char* DEVICE = "waterHeightAlertEFSS";
const char* DEVICE_RAINDROP = "raindropSensorEFSS";
const char* ALERT = "alertActuatorEFSS";

// MISC
long lastMsg = 0;

// PAYLOAD 
char payload[512];

// LED PIN
volatile byte ledState = LOW;

// SENSOR
#define waterLevel 32
#define ledPin 2
#define rainAnalog 35
#define rainDigital 34

// VARIABLES
int val = 0;
int raindrop_val = 0;
bool flood = false;
bool state = false;

void setup() {
  // put your setup code here, to run once:
  pinMode(waterLevel, OUTPUT);
  pinMode(ledPin, OUTPUT);
  pinMode(rainDigital,INPUT);
  digitalWrite(waterLevel, LOW);
  
  Serial.begin(115200);
 
  setupWifi();
  client.setServer(BROKER_SERVER, BROKER_PORT);
  client.setCallback(mqttCallback);
  timeClient.begin();
  timeClient.setTimeOffset(25200);
  
}

char *time_stamp(){
  char *timestamp = (char *)malloc(sizeof(char) * 16);
  time_t ltime;
  ltime=time(NULL);
  struct tm *tm;
  tm=localtime(&ltime);
  
  sprintf(timestamp,"%04d%02d%02d%02d%02d%02d", tm->tm_year+1900, tm->tm_mon, 
      tm->tm_mday, tm->tm_hour, tm->tm_min, tm->tm_sec);
  return timestamp;
}

void loop() {
  // TRY TO CONNECT TO BROKER 
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  timeClient.update();
  int waterLevelDetected = readWaterLevelSensor();
  int rainDropDetected = readRainDropSensor();
  String formattedTime = timeClient.getFormattedTime();
  
  

  state = !state;
  digitalWrite(ledPin, state);

  // FLOOD STARTED
  if((waterLevelDetected > 1000) && (!flood)){
      flood = true;

      sprintf(payload, "{\"payload\":{\"message\": \"Flood Detected, Sending alert.\"}}");

      Serial.println(payload);
      client.publish(ALERT, payload);
  }

  // FLOOD ENDED
  if((waterLevelDetected < 1000) && (flood)){
      flood = false;

      sprintf(payload, "{\"payload\":{\"message\": \"Flood ended! You're safe!\"}}");

      Serial.println(payload);
      client.publish(ALERT, payload);
  }

  // Sent Water Level Data when Water Detected
  if(waterLevelDetected > 0){
    sprintf(payload, "{\"water_level\": %d, \"timestamp\": %s}", waterLevelDetected, formattedTime);
    Serial.println(payload);
    
    client.publish(DEVICE, payload);
  }
  
  // Sent Rain Drop Data when Water Detected
  if(rainDropDetected > 0){
    sprintf(payload, "{\"rain_drop\": %d, \"timestamp\": %s}", rainDropDetected, formattedTime);
    Serial.println(payload);
    
    client.publish(DEVICE_RAINDROP, payload);
  }

  
  delay(2000);
}

int readWaterLevelSensor() {
  digitalWrite(waterLevel, HIGH);   // Turn the sensor ON
  delay(10);                        // wait 10 milliseconds
  val = analogRead(waterLevel);     // Read the analog value form sensor
  digitalWrite(waterLevel, LOW);    // Turn the sensor OFF
  return val;                       // send current reading
}

int readRainDropSensor() {
  raindrop_val = analogRead(rainAnalog);
  delay(10);
  return 
}

void setupWifi() {
  delay(1000);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(SSID);

  WiFi.begin(SSID, SSID_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void mqttCallback(char* topic, byte* message, unsigned int length) {
  Serial.print("Message arrived on topic: ");
  Serial.print(topic);
  Serial.print(". Message: ");
  String messageTemp;
  
  for (int i = 0; i < length; i++) {
    Serial.print((char)message[i]);
    messageTemp += (char)message[i];
  }
  Serial.println(messageTemp);
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect("waterHeightDetector", CLIENT, CLIENT_PASSWORD)) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}