#include <WiFi.h>
#include <PubSubClient.h>

WiFiClient espClient;
PubSubClient client(espClient);

// 1. WIFI CONFIG
const char* SSID = "";
const char* SSID_PASSWORD = "";

// 2. MQTT CLIENT CONFIG
char CLIENT[]= "app-Esp32ElectricalFloodSafetySystem";
char CLIENT_PASSWORD[]="0r2p9o9ttu7YpwLYiKXwJIb9SLjwKF";

// 3. MQTT BROKER CONFIG
const char* BROKER_SERVER = "202.148.1.57";
const int BROKER_PORT = 1883;

// 4. DEVICE
const char* DEVICE = "waterHeightDetectorEFSS";
const char* ALERT = "alertActuatorEFSS";

// MISC
long lastMsg = 0;

// PAYLOAD 
char payload[512];

// LED PIN
volatile byte ledState = LOW;

// SENSOR
#define led_1 25
#define led_2 33
#define led_3 32

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  setupWifi();
  client.setServer(BROKER_SERVER, BROKER_PORT);
  client.setCallback(mqttCallback);
  
  pinMode(led_1, OUTPUT);
  pinMode(led_2, OUTPUT);
  pinMode(led_3, OUTPUT);
}

void loop() {
  // put your main code here, to run repeatedly:
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  digitalWrite(led_1, ledState);
  digitalWrite(led_2, !ledState);
  digitalWrite(led_3, ledState);

  delay(1000);
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

  if (String(topic) == ALERT) {
    if(messageTemp == "{\"payload\":{\"message\": \"Flood ended! You're safe!\"}}"){
      Serial.println("Flood ended!");
      ledState = HIGH;
    }
    else if(messageTemp == "{\"payload\":{\"message\": \"Flood Detected, Sending alert.\"}}"){
      Serial.println("Flood Detected!");
      ledState = LOW;
    }
  }
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect("alertActuator", CLIENT, CLIENT_PASSWORD)) {
      Serial.println("connected");
      Serial.println(ALERT);
      client.subscribe(ALERT);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}
