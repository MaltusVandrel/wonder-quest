import { EventEmitter } from "@angular/core";

export class ChildComponent extends EventEmitter{
    parent:any;
    key:any;
    init(parent:any){
        this.parent=parent;
    }
}