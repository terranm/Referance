import { Animator, Collider, WaitForSeconds } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class Sensor extends ZepetoScriptBehaviour {

    public anim: Animator;

    OnTriggerEnter(other: Collider) {
        console.log("on");
        if (other.gameObject.tag == "Player") {
            this.StartCoroutine(this.OpenDoor());
        }
    }

    *OpenDoor() {
        this.anim.SetFloat("asdf", 1);
        yield new WaitForSeconds(2);
        this.anim.SetFloat("asdf", -1);
    }

}