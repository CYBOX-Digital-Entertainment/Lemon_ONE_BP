import { world, system } from "@minecraft/server";
import { headlight_off, headlight_on, on_left_signal, on_right_signal, windows_close, windows_open } from "./useFunction";
world.beforeEvents.itemUse.subscribe(({ source, itemStack, cancel }) => {
    system.run(() => {
        if (itemStack.typeId.startsWith(`addon:`)) {
            cancel = true;
        }
        console.warn(itemStack.typeId);
        switch (itemStack.typeId) {
            case "addon:headlight_off": {
                headlight_off(source);
                break;
            }
            case "addon:headlight_on": {
                headlight_on(source);
                break;
            }
            case "addon:horn": {
                break;
            }
            case "addon:left_signal_off": {
                break;
            }
            case "addon:left_signal_on": {
                on_left_signal(source);
                break;
            }
            case "addon:right_signal_off": {
                break;
            }
            case "addon:right_signal_on": {
                on_right_signal(source);
                break;
            }
            case "addon:roll_down": {
                windows_open(source);
                break;
            }
            case "addon:roll_up": {
                windows_close(source);
                break;
            }
            default:
                break;
        }
    });
});
