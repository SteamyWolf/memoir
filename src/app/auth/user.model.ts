import { Column } from "../shared/all-templates/column.model";

export interface User {
    uId?: string;
    email?: string | null | undefined;
    photoUrl?: string | undefined | null;
    displayName?: string | undefined | null;
    provider?: string | undefined | null;
    data?: Data;
}


export interface Data {
    chosenTemplates: Template[];
}

export interface Template {
    uuid: string;
    type: string;
    title: string;
    columns: Column[];
}