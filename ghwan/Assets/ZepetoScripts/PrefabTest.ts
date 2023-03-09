import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameManager from './GameManager'

export default class PrefabTest extends ZepetoScriptBehaviour {

    Start() {    
        let tank = GameManager.Resource().Instantiate("Tank");
    }

}