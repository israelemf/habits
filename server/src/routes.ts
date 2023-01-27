import { FastifyInstance } from "fastify"
import { z } from 'zod'
import { prisma } from "./lib/prisma"
import dayjs from 'dayjs'

export async function appRoutes(app: FastifyInstance) {

    // body => Corpo da requisição, informações na hora que a gente ta criando ou atualizando um recurso. ex: usuário (nome, email)
    // params => Parâmetros na rota para identificar um recurso. ex: habits/1
    // query => Paginação, filtro

    app.post('/habits', async (request) => {

        const createHabitBody = z.object({
            // Quando o atributo não for obrigatório, passar um .nullable.
            title: z.string(),
            weekDays: z.array(
                z.number().min(0).max(6)
            )

        })

        //Zod irá validar esses dados.
        //Zod além de validar, traz as tipagens exatas de cada parametro.
        const { title, weekDays } = createHabitBody.parse(request.body)

        // Day.s permite varias operações com data

        const today = dayjs().startOf('day').toDate()

        await prisma.habit.create({
            data: {
                title,
                created_at: today,
                weekDays: {
                    create: weekDays.map(weekDay => {
                        return {
                            week_day: weekDay,
                        }
                    })
                }
            }
        })
    })

    app.get('/day', async (request) => {
        const getDayParams = z.object({

            // Coerce => Puxa o valor manipulado
            date: z.coerce.date()
        })

        const { date } = getDayParams.parse(request.query)


        const parsedDate = dayjs(date).startOf('day')
        // O dia da semana => get('day')
        const weekDay = parsedDate.get('day')

        // Todos hábitos possíveis
        // Hábitos que já foram completados

        const possibleHabits = await prisma.habit.findMany({
            where: {
                created_at: {
                    lte: date,

                },
                weekDays: {
                    some: {
                        week_day: weekDay
                    }
                }
            }
        })

        const day = await prisma.day.findUnique({
            where: {
                date: parsedDate.toDate(),
            },
            include: {
                dayHabits: true
            }
        })

        const completedHabits = day?.dayHabits.map(dayHabit => {
            return dayHabit.habit_id
        })

        return {
            possibleHabits,
            completedHabits
        }
    })
}

