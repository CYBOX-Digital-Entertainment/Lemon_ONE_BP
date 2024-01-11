import { world, system, EntityInventoryComponent } from "@minecraft/server";
import { playAni, on_off } from "./function";

world.beforeEvents.itemUse.subscribe(({ source, itemStack, cancel }) => {
    const iv = source.getComponent(EntityInventoryComponent.componentId) as EntityInventoryComponent
    const index = source.selectedSlot; // 추후 플래이어의 메인헨드 인덱스를 불러와 기입할것
    system.run(() => {
        if (itemStack.typeId.startsWith(`addon:`)) {
            cancel = true
        }
        console.warn(itemStack.typeId)
        switch (itemStack.typeId) {
            case "addon:headlight_off": {
                playAni(source, "light_off")
                on_off(iv, "addon:headlight_on", index)
                break;
            }
            case "addon:headlight_on": {
                playAni(source, "light_on")
                on_off(iv, "addon:headlight_off", index)
                break;
            }
            case "addon:dw_tosca_horn": {
                break;
            }
            case "addon:left_signal_off": {
                playAni(source, "left_signal_off")
                on_off(iv, "addon:left_signal_on", index)
                break;
            }
            case "addon:left_signal_on": {
                playAni(source, "left_signal_on")
                on_off(iv, "addon:left_signal_off", index)
                break;
            }
            case "addon:right_signal_off": {
                playAni(source, "right_signal_off")
                on_off(iv, "addon:right_signal_on", index)
                break;
            }
            case "addon:right_signal_on": {
                playAni(source, "right_signal_on")
                on_off(iv, "addon:right_signal_off", index)
                break;
            }
            case "addon:roll_down": {
                playAni(source, "main_windows_close")
                on_off(iv, "addon:roll_up", index)
                break;
            }
            case "addon:roll_up": {
                playAni(source, "main_windows_open")
                on_off(iv, "addon:roll_down", index)
                break;
            }
        }
    })
});
