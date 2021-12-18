import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProfileService {
    callProfileMethod: Subject<string> = new Subject<string>();
    constructor() {}

    emitData(key: string) {
        this.callProfileMethod.next(key);
    }

}
