import { Service } from '@common/module/decorator'
import crypto from 'crypto'

@Service({ name: 'global.service.jwt' })
export class JWTService {
    encode(payload: { [x: string]: any }, config: { secret: string, exp: number }) {
        const header = { alg: 'HS256', typ: 'JWT' }
        const encodedHeader = this.base64urlEncode(JSON.stringify(header))

        const nowInSeconds = new Date(Date.now()).getTime() / 1000

        payload.iat = nowInSeconds
        payload.exp = nowInSeconds + config.exp

        const encodedPayload = this.base64urlEncode(JSON.stringify(payload))

        const signature = this.sign(`${encodedHeader}.${encodedPayload}`, config.secret)

        return `${encodedHeader}.${encodedPayload}.${signature}`
    }

    decode(token: string, secret: string) {
        const parts = token.split('.')
        if (parts.length !== 3) {
            throw new Error('Token inválido')
        }

        const encodedHeader = parts[0]
        const encodedPayload = parts[1]
        const signature = parts[2]

        const signedPart = `${encodedHeader}.${encodedPayload}`
        const computedSignature = this.sign(signedPart, secret)
        if (this.base64urlUnescape(signature) !== this.base64urlUnescape(computedSignature)) {
            throw new Error('Assinatura inválida')
        }

        const payload = JSON.parse(this.base64urlDecode(encodedPayload))

        return payload
    }

    private base64urlEncode(data: any) {
        return Buffer.from(data).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    }

    private sign(data: any, secret: string) {
        return crypto.createHmac('sha256', secret).update(data).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    }

    private base64urlDecode(data: any) {
        let base64String = data.replace(/-/g, '+').replace(/_/g, '/')
        const padding = 4 - base64String.length % 4
        if (padding !== 4) {
            for (let i = 0; i < padding; i++) {
                base64String += '='
            }
        }
        return Buffer.from(base64String, 'base64').toString()
    }

    private base64urlUnescape(str: string) {
        return str + '==='.slice(0, (4 - str.length % 4) % 4)
    }
}
