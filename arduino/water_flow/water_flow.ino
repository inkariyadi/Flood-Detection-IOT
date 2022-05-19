/*
  Application:
  – Interface water flow sensor with ESP32 board.
  
  Board:
  – ESP32 Dev Module
    https://my.cytron.io/p-node32-lite-wifi-and-bluetooth-development-kit
  Sensor:
  – G 1/2 Water Flow Sensor
    https://my.cytron.io/p-g-1-2-water-flow-sensor
 */

#define LED_BUILTIN 2
#define SENSOR  27

long currentMillis = 0;
long previousMillis = 0;
int interval = 1000;
boolean ledState = LOW;
float calibrationFactor = 4.5;
volatile byte pulseCount;
byte pulse1Sec = 0;
float flowRate;
unsigned int flowMilliLitres;
unsigned long totalMilliLitres;

void IRAM_ATTR pulseCounter()
{
  pulseCount++;
}

void setup()
{
  Serial.begin(115200);

  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(SENSOR, INPUT_PULLUP);

  pulseCount = 0;
  flowRate = 0.0;
  flowMilliLitres = 0;
  totalMilliLitres = 0;
  previousMillis = 0;

  attachInterrupt(digitalPinToInterrupt(SENSOR), pulseCounter, FALLING);
}

void loop()
{
  currentMillis = millis();
  if(currentMillis - previousMillis > interval) {
    pulse1Sec = pulseCount;
    pulseCount = 0;

    flowRate = ((1000.0 / (millis() - previousMillis)) * pulse1Sec) / calibrationFactor;
    previousMillis = millis();

    flowMilliLitres = (flowRate / 60 ) * 1000;

    Serial.print("FlowRate: ");
    Serial.print(int(flowRate));
    Serial.print("L / min");
    Serial.print("\t");

    Serial.print("Output Liquid Quantity: ");
    Serial.print(totalMilliLitres / 1000);
    Serial.print("L");
  }
}
