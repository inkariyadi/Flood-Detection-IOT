

export const HelloWorld = async (req, res) => {
    return res.status(200).send("Hello from MQTT Receiver");
}