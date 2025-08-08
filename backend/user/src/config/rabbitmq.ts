import amqp from 'amqplib';


let channel: amqp.Channel;
export const connectRabbitMQ = async()=>{
    try{
        const connection = await amqp.connect({
        protocol: "amqp",
        hostname: process.env.RabbitMQ_Host,
        port: 5677,
        username: process.env.RabbitMQ_Username,
        password: process.env.RabbitMQ_Password
    })
    channel = await connection.createChannel()
    console.log("✅ RabbitMQ connected")
    }catch(err){
        console.log("Failed to connect to rabbitmq",err)
    }
};

export const publishToQueue = async(queueName:string, message:any)=>{
    if(!channel){
     console.log("RabbitMQ channel is not initialized");
     return;
    }

    await channel.assertQueue(queueName, {durable:true})
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)),{
        persistent:true
    })
};