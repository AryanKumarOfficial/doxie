import {inngest} from "@/lib/inngest";

export const documentSave = inngest.createFunction(
    {id: "documentSave"},
    {event: 'document.save'},
    async ({event}) => {
        const {documentId, snapshot, createdBy} = event.data;
        await prisma?.documentRevision.create({data: {documentId, snapshot, createdBy}});
    }
);