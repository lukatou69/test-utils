import { Tokenizator } from "./TokenGenerator"

type StorageItem<T> = {
    expireTime: number
    cookie: string
    ref: T
}

type RepeatOption = {
    max: number
    action: 'ignore_add' | 'replace_oldest'
}

const getCurrentTime = () => new Date().getTime()
const calculateTime = (milliseconds: number) => getCurrentTime() + milliseconds
const validToken = (token: StorageItem<any>, currentTime: number) => token.expireTime > currentTime



/**
 * T: reference to object
 */
export class TokenStorage<T> {

    private expire: number
    private repeat?: RepeatOption
    private tokenGenerator: Tokenizator

    private storage: StorageItem<T>[]

    /**
     * @param repeat max time a reference can be added to storage
     */
    constructor(tokenGenerator: Tokenizator, expire: number, repeat?: RepeatOption) {
        this.expire = expire
        this.repeat = repeat

        this.tokenGenerator = tokenGenerator
    }

    private run<R>(task: () => R) {
        this.update()

        return task()
    }

    /**
     * Validate storage (check expire)
     */
    update() {
        const currentTime = getCurrentTime()

        this.storage = this.storage.filter(each => validToken(each, currentTime))
    }

    add(ref: T): StorageItem<T>['cookie'] | null {
        return this.run(() => {
            if (this.repeat) {
                const { action, max } = this.repeat

                const collection = this.storage.filter(each => each.ref === ref)

                if (collection.length >= max) {
                    switch (action) {
                        case 'ignore_add':
                            return null
                        case 'replace_oldest':
                            const { cookie } = collection.sort((a, b) => a.expireTime > b.expireTime ? -1 : 1)[0]

                            // Remove cookie from storage
                            this.filter(each => each.cookie !== cookie)

                            break
                    }

                }
            }

            const randomCookie = this.tokenGenerator.createRandomToken()

            this.storage.push({
                expireTime: calculateTime(this.expire),
                ref,
                cookie: randomCookie
            })

            return randomCookie
        })
    }

    filter(filter: (each: StorageItem<T>) => boolean) {
        this.run(() => {
            this.storage = this.storage.filter(filter)
        })
    }

    exists(ref: T): boolean {
        return this.run(() => this.storage.some(each => each.ref === ref))
    }

    existsCookie(cookie: StorageItem<T>['cookie']): boolean {
        return this.run(() => this.storage.some(each => each.cookie === cookie))
    }

    /**
     * @returns valid cookie as syntax way not expire time.
     */
    validTokenSyntax(): Tokenizator['validToken'] {
        return this.tokenGenerator.validToken
    }
}