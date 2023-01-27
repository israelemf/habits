import Fastify from "fastify";
import cors from '@fastify/cors';
import { appRoutes } from "./routes";

const app = Fastify();

/**
 * Método HTTP: GET, POST, PUT, PATCH, DELETE
 * GET => Buscar alguma informação
 * POST => Criar algum recurso
 * PUT => Atualizar algum recurso
 * PATCH => Atualizar algo especifico do recurso
 * DELETE => Deletar um recurso
 */

app.register(cors)
app.register(appRoutes)


app.listen({
    port:3333,
}).then(() => {
    console.log("HTTP Server running! \n localhost:3333/home");
})