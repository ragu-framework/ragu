import {sayHello as say2} from "./dep2";

export const sayHello = (name: string) => say2(name);
