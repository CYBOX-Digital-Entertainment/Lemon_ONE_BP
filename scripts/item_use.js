import { world, system } from "@minecraft/server";
import { playAni } from "./function";
world.beforeEvents.itemUse.subscribe(({ source, itemStack, cancel }) => {
    const item = source.getComponent("equippable") ?? undefined;
    if (item == undefined)
        return;
    system.run(() => {
        if (itemStack.typeId.startsWith(`addon:`)) {
            cancel = true;
        }
        console.warn(itemStack.typeId);
        switch (itemStack.typeId) {
            case "addon:headlight_off": {
                playAni(source, "");
                break;
            }
            case "addon:headlight_on": {
                playAni(source, "");
                break;
            }
            case "addon:horn": {
                break;
            }
            case "addon:left_signal_off": {
                playAni(source, "");
                break;
            }
            case "addon:left_signal_on": {
                playAni(source, "");
                break;
            }
            case "addon:right_signal_off": {
                playAni(source, "");
                break;
            }
            case "addon:right_signal_on": {
                playAni(source, "");
                break;
            }
            case "addon:roll_down": {
                playAni(source, "main_windows_close");
                break;
            }
            case "addon:roll_up": {
                playAni(source, "main_windows_open");
                break;
            }
        }
    });
});
