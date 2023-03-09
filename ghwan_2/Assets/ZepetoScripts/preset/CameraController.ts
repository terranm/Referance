import { Camera, GameObject, Input, LayerMask, Mathf, Physics, Quaternion, RaycastHit, WaitForSeconds, YieldInstruction } from 'UnityEngine';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoWorldMultiplay } from 'ZEPETO.World';
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
    private isGetPassport : boolean = false;
    private isGetDisembarkationCard : boolean = false;

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
                    // 여권 획득
                    console.log("여권 획득");
                    this.isGetPassport = true;
                    //ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.SetParent(this.starter.busTr);
                    //ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.Teleport(this.starter.busTr.position,Quaternion.identity);
                }
                else if(_hit.collider.gameObject.name == "DisembarkationCard"){
                    // 입국 신고서 작성 완료
                    console.log("입국신고서 작성 완료");
                    this.isGetDisembarkationCard = true;
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