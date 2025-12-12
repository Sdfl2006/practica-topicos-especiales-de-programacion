import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose'
import { User } from './user.js'

const app = express();
dotenv.config();

const connectDB = () => {
    const {
        MONGO_USERNAME,
        MONGO_PASSWORD,
        MONGO_HOSTNAME,
        MONGO_PORT,
        MONGO_DB,
    } = process.env;

    const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;

    mongoose.connect(url).then(function() {
        console.log('MongoDB connected')
    })
    .catch(function (err) {
        console.log(err);
    });

}

const port = 3005
app.use(cors({origin: '*'})); //cors
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended: false}));

app.listen(port, function() {
    connectDB()
    console.log(`Api corriendo en http://localhost:${port}`)
})

app.get('/', (req, res) => {
    console.log('Mi primer endpoint')
    res.status(200).send('Hola, la API esta funcionando correctamente')
});

app.post('/', async (req, res) => {
    try {
        var data = req.body;
        // Si mongoose no está conectado, respondemos en modo prueba
        if (mongoose.connection.readyState !== 1) {
            return res.status(200).send({
                success: true,
                message: 'Modo prueba: no conectado a DB, usuario no persistido',
                outcome: data
            })
        }

        var newuser = new User(data);
        await newuser.save();
        res.status(200).send({
            success: true,
            message: 'Usuario guardado correctamente',
            outcome: []
        })
    }
    catch (err) {
        res.status(400).send({
            success: false,
            message: "Error al guardar usuario",
            outcome: []
        })
    }
});

app.get('/usuarios', async (req, res) => {
    try {
        const usuarios = await User.find().exec();

        res.status(200).send({
            success: true,
            message: "Se encontraron los usuarios exitosamente",
            outcome: usuarios 
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: "Error al intentar obtener los usuarios, por favor intente nuevamente",
            outcome: []
        });
    }
});

app.patch('/usuarios/:id', async (req, res) => {
    try {
        const userId = req.params.id;
                const updateData = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            updateData, 
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).send({
                success: false,
                message: "Usuario no encontrado",
                outcome: null
            });
        }

        res.status(200).send({
            success: true,
            message: "Usuario actualizado exitosamente",
            outcome: updatedUser
        });

    } catch (err) {
        res.status(400).send({
            success: false,
            message: "Error al intentar actualizar el usuario, por favor revise los datos",
            outcome: err.message
        });
    }
});
