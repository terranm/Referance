import { AnimationClip, GameObject, WaitForSeconds } from 'UnityEngine';
import { Button } from 'UnityEngine.UI';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoWorldMultiplay } from 'ZEPETO.World';


export default class GestureController extends ZepetoScriptBehaviour
{

    public gestureListButtons: Button[];
    public gestureClips: AnimationClip[];
    public multiplay: ZepetoWorldMultiplay;
    Start()
    {
        this.multiplay = GameObject.Find("WorldMultiplay").GetComponent<ZepetoWorldMultiplay>();
        for (let i = 0; i < this.gestureClips.length; ++i)
        {
            this.gestureListButtons[i].onClick.AddListener(() =>
            {
                this.multiplay.Room.Send("GestureNum", i);
                this.multiplay.Room.Send("Gesture", this.multiplay.Room.SessionId);
                const character = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
                character.SetGesture(this.gestureClips[i]);
                this.StartCoroutine(this.StopCharacterGesture(this.gestureClips[i].length - 0.3));

            });
        }
    }

    *StopCharacterGesture(length: number)
    {
        yield new WaitForSeconds(length);
        const character = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
        character.CancelGesture();
    }
}