export module Script {
    export var Name = "CUWCL4C";
    export var Home = "https://greasyfork.org/zh-CN/scripts/2600";
    export var Config = "https://jixunmoe.github.io/cuwcl4c/config/";
    export var Feedback = "https://greasyfork.org/forum/post/discussion?Discussion/ScriptID=2600";

    export function ListenEvent<T>(listener:CustomEventListener<T>) {
        document.addEventListener(Name, (e: CustomEvent) => {
            var info: T;
            if (typeof e.detail == 'string') {
                info = JSON.parse(e.detail);
            } else {
                info = e.detail as T;
            }
            listener(info);
        });
    }
}

interface CustomEventListener<T> {
    (e: T): void;
}