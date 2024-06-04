import { world } from "@minecraft/server";
export class EntityData {
    constructor(data = undefined) {
        this.entid = data?.entid ?? "";
        this.plid = data?.plid ?? "";
        this.trid = data?.trid ?? "";
        this.tropen = data?.tropen ?? false;
        this.ride = data?.ride ?? false;
        this.ride2 = data?.ride2 ?? false;
        this.enableFriend = data?.enableFriend ?? false;
        this.option = data?.option ?? false;
    }
    setPlid(id) {
        this.plid = id;
        return this;
    }
    setTrOpen(open) {
        this.tropen = open;
        return this;
    }
    setEntId(id) {
        this.entid = id;
        return this;
    }
    setTrId(id) {
        this.trid = id;
        return this;
    }
    setRide(ride) {
        this.ride = ride;
        return this;
    }
    trunk() {
        console.warn(this.trid)
        //return world.getEntity(this.trid);
    }
    entity() {
        //return world.getEntity(this.entid);
    }
}
