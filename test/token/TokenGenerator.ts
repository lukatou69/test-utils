const phraseType = {
    "aZ09$": 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#!%&()',
    "aZ09": 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    "aZ": 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    "09": "0123456789"
} as const

type PhraseKeyType = keyof typeof phraseType
type PhraseValueType = typeof phraseType[PhraseKeyType]


export class Tokenizator {

    private tokenLength: number
    private phrase: PhraseValueType

    constructor(tokenLegth: number, phrase: PhraseKeyType) {
        this.tokenLength = tokenLegth
        this.phrase = phraseType[phrase]
    }


    createRandomToken(): string {
        const { floor, random } = Math
        const phraseLength = this.phrase.length

        const result: string[] = []

        for (let i = 0; i < this.tokenLength; i++) {
            result.push(this.phrase.charAt(floor(random() * phraseLength)))
        }

        return result.join('')
    }

    validToken(token: string): boolean {
        if (token.length !== this.tokenLength) {
            return false
        }

        const hasLetter = (letter: string) => Array.from(this.phrase).some(each => each === letter)

        return Array.from(token).every(hasLetter)
    }

    createCookie(key: string, token: string | null, expire: number): { key: string, value: string, headers: any} {
        return {
            key,
            value: token || this.createRandomToken(),
            headers: {
                httpOnly: true,
                secure: true,
                maxAge: expire,
                sameSite: "strict",
                path: '/'
            }

        }
    }
}