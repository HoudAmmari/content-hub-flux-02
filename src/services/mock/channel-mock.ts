import { Channel } from "@/models/types";

export default [
    {
        id: "2CC811A1-1750-4AC5-B57B-447BC5621C73",
        name: "Short Videos",
        statuses: [
            {
                index: 0,
                name: "Ideia",
                type: "backlog"
            },
            {
                index: 1,
                name: "TODO",
                type: "in_progress"
            },
            {
                index: 2,
                name: "Escrevendo",
                type: "in_progress"
            },
            {
                index: 3,
                name: "Gravação",
                type: "in_progress"
            },
            {
                index: 4,
                name: "Edição",
                type: "in_progress"
            },
            {
                index: 5,
                name: "Pronto",
                type: "pending"
            },
            {
                index: 6,
                name: "Publicado",
                type: "done"
            }
        ]
    },
    {
        id: "E4EB7017-B3B8-4316-A2A8-11B294533388",
        name: "Blog",
        statuses: [
            {
                index: 0,
                name: "Ideia",
                type: "backlog"
            },
            {
                index: 1,
                name: "Rascunho",
                type: "in_progress"
            },
            {
                index: 2,
                name: "Revisão",
                type: "in_progress"
            },
            {
                index: 3,
                name: "Publicado",
                type: "done"
            }
        ]
    },
    {
        id: "EFCF90B6-465E-41D9-B172-A5252792BE61",
        name: "Posts",
        statuses: [
            {
                index: 0,
                name: "Ideia",
                type: "backlog"
            },
            {
                index: 1,
                name: "Escrevendo",
                type: "in_progress"
            },
            {
                index: 2,
                name: "Pronto",
                type: "pending"
            },
            {
                index: 3,
                name: "Publicado",
                type: "done"
            }
        ]
    },
    {
        id: "C1D6FE88-080C-43C3-9AD3-EAE4DAC3BE97",
        name: "Youtube",
        statuses: [
            {
                index: 0,
                name: "Ideia",
                type: "backlog"
            },
            {
                index: 1,
                name: "Escrevendo",
                type: "in_progress"
            },
            {
                index: 2,
                name: "Revisão",
                type: "in_progress"
            },
            {
                index: 3,
                name: "Gravação",
                type: "in_progress"
            },
            {
                index: 4,
                name: "Edição",
                type: "in_progress"
            },
            {
                index: 5,
                name: "Pronto",
                type: "pending"
            },
            {
                index: 6,
                name: "Publicado",
                type: "done"
            }
        ]
    }
] as Channel[];
