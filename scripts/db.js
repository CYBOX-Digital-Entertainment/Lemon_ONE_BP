import { world } from "@minecraft/server";
export function saveData(varname, value) {
    if (value === undefined) {
        world.setDynamicProperty(varname, undefined);
        return;
    }
    const mkValue = JSON.stringify(value);
    world.setDynamicProperty(varname, mkValue);
}
export function readData(varname) {
    try {
        const getValue = world.getDynamicProperty(varname);
        if (getValue == undefined) {
            return undefined;
        }
        return JSON.parse(`${getValue}`);
    }
    catch (error) {
        return `${world.getDynamicProperty(varname)}`;
    }
}
