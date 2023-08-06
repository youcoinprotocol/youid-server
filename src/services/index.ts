import { reputation } from './reputations/reputations'
import { identity } from './identities/identities'
import { wallet } from './wallets/wallets'
import { otp } from './otps/otps'
import { authOtp } from './authentication/otp/otp'
import { user } from './users/users'
// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html#configure-functions
import type { Application } from '../declarations'
import mailer from 'feathers-mailer'
const sendgrid = require('nodemailer-sendgrid-transport')

export const services = (app: Application) => {
  app.configure(reputation)
  app.configure(identity)
  app.configure(wallet)
  app.configure(otp)
  app.configure(authOtp)
  app.configure(user)
  // All services will be registered here
  app.use(
    'mailer',
    mailer(
      sendgrid({
        auth: {
          api_key: app.get('sendgrid').apiKey
        }
      })
    )
  )
}
