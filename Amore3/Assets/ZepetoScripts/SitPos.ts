import { Quaternion, Time, Transform, Vector3, WaitForSeconds } from 'UnityEngine'
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoWorldMultiplay } from 'ZEPETO.World';

export default class SitPos extends ZepetoScriptBehaviour {

    public sitPos: Transform;
    public multiplay: ZepetoWorldMultiplay;
    sec: number = 0.2;

    OnEnable() {
        this.StartCoroutine(this.FindCamera());
    } 

    *FindCamera() {
        while(true){
            yield new WaitForSeconds(this.sec);
            if (this.multiplay.Room != null && this.multiplay.Room.IsConnected) {
                let has = ZepetoPlayers.instance.HasPlayer(this.multiplay.Room.SessionId);
                if (has) {
                    let camera = ZepetoPlayers.instance.LocalPlayer.zepetoCamera.camera.gameObject;
                    let dir = Quaternion.LookRotation(camera.transform.position - this.transform.position).normalized;
                    dir.x = 0;
                    dir.z = 0;
                    this.transform.rotation = Quaternion.Slerp(this.transform.rotation, dir, 5 * Time.deltaTime);
                }
            }
        }
    }
}