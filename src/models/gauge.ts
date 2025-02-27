import { ChildComponent } from "./child-component";

export class Gauge extends ChildComponent{
    title: string = '';
    value: number = 100;
    modValue: number = 100;
    consumed: number = 0;
    constructor(){
        super();
    }
    getCurrent(){
        return this.value-this.consumed;
    }
}