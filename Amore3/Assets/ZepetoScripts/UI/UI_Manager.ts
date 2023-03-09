import { Button } from 'UnityEngine.UI';
import { SpawnInfo, ZepetoCharacter, ZepetoPlayer, ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export enum TargetDisplay {
    display1,
    display2
}

export default class UI_Manager extends ZepetoScriptBehaviour {

    public cameraBtn: Button;
    public display: TargetDisplay;

    Start() {

        this.cameraBtn.onClick.AddListener(() => {
            let camera = ZepetoPlayers.instance.LocalPlayer.zepetoCamera.camera;
            if (camera.targetDisplay == TargetDisplay.display1)
                camera.targetDisplay = 1;
            else camera.targetDisplay = 0;
        })
    }

}