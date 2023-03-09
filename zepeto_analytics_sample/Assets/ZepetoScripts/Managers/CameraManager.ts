import { Input, LayerMask, Mathf, Physics, RaycastHit } from 'UnityEngine';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoWorldMultiplay } from 'ZEPETO.World';
import GameManager from './GameManager';

export default class CameraManager extends ZepetoScriptBehaviour {


    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Singleton
    private static _instance: CameraManager;
    public static get instance(): CameraManager { return CameraManager._instance; }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Singleton END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Property
    private layer_btn : number;
    public multiplay : ZepetoWorldMultiplay;
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Property END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Setting
    Awake()
    {
        CameraManager._instance = this;
    }
    Start()
    {
        this.layer_btn = 1 << LayerMask.NameToLayer("Button");
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Setting END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Raycast
    Update()
    {
        if (this.multiplay.Room != null && this.multiplay.Room.IsConnected)
        {
            const hasPlayer = ZepetoPlayers.instance.HasPlayer(this.multiplay.Room.SessionId);
            if (hasPlayer)
            {
                this.Raycasting();
            }
        }
    }

    Raycasting()
    {
        if(Input.GetMouseButtonUp(0))
        {
            let ray = ZepetoPlayers.instance.ZepetoCamera.camera.ScreenPointToRay(Input.mousePosition);
            let hitInfo = $ref<RaycastHit>();
            if(Physics.Raycast(ray, hitInfo, Mathf.Infinity, this.layer_btn))
            {
                console.log(`---------------------- ${hitInfo.value.transform.name}`);
                GameManager.instance.SwitchButtonScript(hitInfo.value.transform)
            }
        }
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Raycast END
}