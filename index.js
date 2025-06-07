const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');


const app = express();
const server = http.createServer(app);
const io = socketIo(server);


mongoose.connect('mongodb+srv://ybarbosa648:@cluster0.pvvenc3.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
console.log('MongoDB Atlas conectado com sucesso');
}).catch(err => {
console.error('Erro ao conectar no MongoDB Atlas:', err);
});

const Post = mongoose.model('Post', {
    titulo: String,
    texto: String
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 


app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
    res.render('index');
});


io.on('connection', async (socket) => {
    console.log('Novo usuário conectado');

    const posts = await Post.find({});
    socket.emit('previousMessage', posts);

    socket.on('sendMessage', async data => {
        const novoPost = new Post({
            titulo: data.titulo,
            texto: data.texto
        });

        await novoPost.save();

        io.emit('receivedMessage', novoPost); 
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
