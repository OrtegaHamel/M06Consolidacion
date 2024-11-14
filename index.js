const http = require("http");
const url = require("url");
const { readFileSync, writeFileSync } = require("fs");
const port = 3000;

// Ubicación del archivo de persistencia
const dataAnime = `${__dirname}/anime.json`;

// Crear Servidor HTTP
const servidor = http.createServer((req, res) => {
    const metodo = req.method;
    const urlParsed = url.parse(req.url, true)
    const pathName = urlParsed.pathname

    res.setHeader("Content-Type", "application/json");

    // Ruta para listar Animes
    if (metodo === "GET" && pathName === "/animes") {
            const contentString = readFileSync(dataAnime, "utf-8");
            let contentJS = JSON.parse(contentString);
            return res.end(JSON.stringify({ message: "Listado de Animes", data: contentJS }))
    }

    // Ruta para buscar por ID o nombre
    if (metodo === "GET" && pathName === "/animes/id-nombre") {
            const { id, nombre } = urlParsed.query;
            const contentString = readFileSync(dataAnime, "utf-8");
            const contentJS = JSON.parse(contentString);

            
            let anime;
            if (id && contentJS[id]) {
                anime = contentJS[id];
            } else if (nombre) {
                anime = Object.values(contentJS).find(a => a.nombre.toLowerCase() === nombre.toLowerCase());
            }

            if (anime) {
                res.writeHead(200);
                return res.end(JSON.stringify({ message: "Anime encontrado", data: anime }));
            } else {
                res.writeHead(404);
                return res.end(JSON.stringify({ message: "Anime no encontrado" }));
            }
    }

    // Ruta para crear Anime   
    if (metodo === "POST" && pathName === "/animes") {
            let body = "";
            req.on("data", (chunk) => {
                body += chunk.toString()
            })

            req.on("end", () => {
                body = JSON.parse(body);
                const contentString = readFileSync(dataAnime, "utf-8");
                const contentJS = JSON.parse(contentString);

                const encontrado = Object.values(contentJS).some(anime =>
                    anime.nombre.toLowerCase() === body.nombre.toLowerCase() &&
                    anime.autor.toLowerCase() === body.autor.toLowerCase()
                );

                if(encontrado) {
                    res.writeHead(409)
                    return res.end(JSON.stringify({ message: "Ese Anime ya existe, intente otra vez"}))
                }

                const nuevoId = String(Object.keys(contentJS).length + 1);

                const anime = {
                    nombre: body.nombre,
                    genero: body.genero,
                    año: body.año,
                    autor: body.autor
                };

                contentJS[nuevoId] = anime;
                writeFileSync(dataAnime, JSON.stringify(contentJS), "utf-8");

                res.writeHead(201);
                return res.end(JSON.stringify({ message: "Anime registrado con éxito", data: anime }));
            });
    }
    
    // Ruta para modificar Anime
    if (metodo === "PUT" && pathName === "/animes") {
            let body = "";
            req.on("data", (parte) => {
                body += parte.toString()
            })

            req.on("end", () => {
                body = JSON.parse(body);
                console.log(body);
                const contentString = readFileSync(dataAnime, "utf-8");
                let contentJS = JSON.parse(contentString);

                if (contentJS[body.id]) {
                    const encontrado = Object.values(contentJS).some(anime =>
                        anime.nombre.toLowerCase() === body.nombre.toLowerCase() &&
                        anime.autor.toLowerCase() === body.autor.toLowerCase() &&
                        anime !== contentJS[body.id] 
                    );
        
                    if (encontrado) {
                        res.writeHead(409);
                        return res.end(JSON.stringify({ message: "Ese Anime ya existe, intente otra vez" }));
                }
        
                    contentJS[body.id] = { ...contentJS[body.id], ...body };
                    writeFileSync(dataAnime, JSON.stringify(contentJS), "utf-8");
                    return res.end(JSON.stringify({ message: "Anime modificado con éxito", data: contentJS[body.id] }));
                }

                res.writeHead(404);
                return res.end(JSON.stringify({ message: "Id de Anime no encontrado"}))
            });
    }

    // Ruta para eliminar Anime
    if (metodo === "DELETE" && pathName === "/animes") {
        const { id } = urlParsed.query;
        const contentString = readFileSync(dataAnime, "utf-8");
        const contentJS = JSON.parse(contentString);

        if (contentJS[id]) {
            const eliminado = contentJS[id];
            delete contentJS[id];
            writeFileSync(dataAnime, JSON.stringify(contentJS), "utf-8");
            return res.end(JSON.stringify({ message: "Anime eliminado con éxito", data: eliminado }));
        }

        res.writeHead(404);
        return res.end(JSON.stringify({ message: "Id de Anime no encontrado" }));
    }
            

}).listen(port, () => {
        console.log(`Aplicación ejecutandose por el puerto ${port}`);
})

module.exports = { servidor, port };