import { Camera, GameObject, Input, LayerMask, Mathf, Physics, Quaternion, RaycastHit, Vector3, WaitForSeconds, YieldInstruction } from 'UnityEngine';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoWorldMultiplay } from 'ZEPETO.World';
import ObjAttach from './ObjAttach';
import PlayerCtrl from './PlayerCtrl';
import Starter from './Starter';

export default class CameraController extends ZepetoScriptBehaviour {
    public multiplay: ZepetoWorldMultiplay;
    layerMask_Button: number = 1 << LayerMask.NameToLayer("Button");
    private camera: Camera;
    private starter:Starter;
    private waitForChangeTargetSeconds: YieldInstruction = new WaitForSeconds(0.01);
    Start() {    
        this.multiplay = GameObject.Find("WorldMultiplay").GetComponent<ZepetoWorldMultiplay>();
        this.starter = GameObject.FindGameObjectWithTag("Starter").GetComponent<Starter>();
        this.layerMask_Button = 1 << LayerMask.NameToLayer("Button");
        this.camera = this.transform.GetComponent<Camera>();
    }

    Update(){
        if (this.multiplay.Room != null && this.multiplay.Room.IsConnected)
        {
            const hasPlayer = ZepetoPlayers.instance.HasPlayer(this.multiplay.Room.SessionId);
            if (hasPlayer)
            {
                this.UIRay();
            }
        }
    }

    UIRay()
    {
        if (Input.GetMouseButtonDown(0))
        {
            var hit = $ref<RaycastHit>();
            var ray = this.camera.ScreenPointToRay(Input.mousePosition);

            if ((Physics.Raycast(ray.origin, ray.direction, hit, Mathf.Infinity, this.layerMask_Button)))
            {
                let _hit = hit.value;
                if(_hit.collider.gameObject.name == "Passport"){
                    // μ¬κΆ νλ
                    let player = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.GetComponentInChildren<PlayerCtrl>();
                    player.isGetPassport = true;
                    console.log("μ¬κΆ νλ " + ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.GetComponentInChildren<PlayerCtrl>().isGetPassport);
                    let tran = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.
                    GetChild(0).GetChild(1).GetChild(2).GetChild(0).GetChild(1).GetChild(2).GetChild(1).GetChild(1).GetChild(0).GetChild(1).GetChild(0).GetChild(0).GetChild(0).GetChild(0);
                    //ZepetoContext > hips > spine > chest > chestUpper > shoulder_L > upperArm_L > upperArmTwist_L > lowerArm_L > lowerArmTwist_L > hand_L > indexPro_L > indexInt_L > indexDis_L
                    let obj = GameObject.Instantiate(_hit.collider.gameObject) as GameObject
                    obj.AddComponent<ObjAttach>();
                    obj.GetComponent<ObjAttach>().ObjAttach(tran, obj);
                    //ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.Teleport(this.starter.busTr.position,Quaternion.identity);
                }
                else if(_hit.collider.gameObject.name == "DisembarkationCard"){
                    // μκ΅­ μ κ³ μ μμ± μλ£
                    let player = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.GetComponentInChildren<PlayerCtrl>();
                    player.isGetDisembarkationCard = true;
                    console.log("μκ΅­μ κ³ μ μμ± μλ£" + ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.GetComponentInChildren<PlayerCtrl>().isGetDisembarkationCard);
                    let tran = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.
                    GetChild(0).GetChild(1).GetChild(2).GetChild(0).GetChild(1).GetChild(2).GetChild(1).GetChild(1).GetChild(0).GetChild(1).GetChild(0).GetChild(0).GetChild(0).GetChild(0);
                    //ZepetoContext > hips > spine > chest > chestUpper > shoulder_L > upperArm_L > upperArmTwist_L > lowerArm_L > lowerArmTwist_L > hand_L > indexPro_L > indexInt_L > indexDis_L
                    let obj = GameObject.Instantiate(_hit.collider.gameObject) as GameObject
                    obj.AddComponent<ObjAttach>();
                    obj.GetComponent<ObjAttach>().ObjAttach(tran, obj);
                    //ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.parent = null;
                    //ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.Teleport(this.starter.returnPos.position,Quaternion.identity);
                }
                
                // this.StartCoroutine(this.SendCharacter(ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.gameObject));
                
            }
        }
    }

    *SendCharacter(obj:GameObject)
    {
        for (let i = 0; i < 6; i++)
        {
            //obj.transform.position = this.starter.busTr.position;
            
            yield this.waitForChangeTargetSeconds;
        }
        
    }

}