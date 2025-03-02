const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { Client, Message } = require('azure-iot-device');
const { Mqtt } = require('azure-iot-device-mqtt');

//  Cadeia de conexão do seu dispositivo para temperatura e umidade do Azure-IOT
const temperatureConnectionString = 'HostName=IOT-Missao05.azure-devices.net;DeviceId=Temperatura;SharedAccessKey=ixb+g9mdHYOZ3G9IG96M6TtJ1mIxsIHkL/aWiK32fR8=';
const humidityConnectionString = 'HostName=IOT-Missao05.azure-devices.net;DeviceId=Umidade;SharedAccessKey=R4yx8ReDQjNFUxcTffyGzg/z/nhn/MA78c3A8nzsGrs=';

// Crie clientes MQTT para cada dispositivo
const temperatureClient = Client.fromConnectionString(temperatureConnectionString, Mqtt);
const humidityClient = Client.fromConnectionString(humidityConnectionString, Mqtt);

// Crie o servidor Express e o Socket.IO
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Servir os arquivos estáticos (HTML, CSS, JS) na pasta public
app.use(express.static('public'));

// Função para gerar dados simulados
function generateTemperatureData() {
    return (Math.random() * 10 + 20).toFixed(2);  // Simula temperatura entre 20 a 30 graus Celsius
}

function generateHumidityData() {
    return (Math.random() * 30 + 40).toFixed(2);  // Simula umidade entre 40% e 70%
}

// Função para enviar mensagem para o IoT Hub
function sendDataToHub(client, temperature, humidity) {
    const data = {
        temperature: temperature,
        humidity: humidity
    };

    const message = new Message(JSON.stringify(data));
    console.log('Enviando dados: ' + message.getData());

    client.sendEvent(message, (err) => {
        if (err) {
            console.error('Erro ao enviar mensagem: ' + err.toString());
        } else {
            //console.log('Mensagem enviada com sucesso');
        }
    });
}

// Função para simular os dispositivos
function simulateDevices() {
    const temperature = generateTemperatureData();
    const humidity = generateHumidityData();

    // Enviar dados via Socket.IO para o frontend
    io.emit('deviceData', { temperature, humidity });

    sendDataToHub(temperatureClient, temperature, null);  // Envia dados de temperatura
    sendDataToHub(humidityClient, null, humidity);        // Envia dados de umidade
}

// Inicia a simulação a cada 5 segundos
setInterval(simulateDevices, 3000);

// Inicia o servidor na porta 3000
server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
