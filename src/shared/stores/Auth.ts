import {makeAutoObservable} from "mobx";
import {User} from "../types/User";


class AuthStore {
    user?: User
    error: boolean = true;

    constructor() {
        makeAutoObservable(this)
    }

    async auth(login, password) {
        this.user = await (new Promise<User>((resolve, reject) => {
            if (this.error) {
                this.error = false;
                reject('Hello error!')
            }
            setTimeout(() => {
                resolve({
                    role: 'admin',
                    login: 'admin'
                })
            }, 2000)
        }))
    }
}

export const authStore = new AuthStore();
