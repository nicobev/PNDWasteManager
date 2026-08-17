const supabase = require('@supabase/supabase-js');
const undici = require('undici');

require('dotenv').config();

const iphoneLocalIP = process.env.MOBILE_LOCAL_IP 

const agent = new undici.Agent({
  connect: { localAddress: iphoneLocalIP }
});

const supabaseclient = supabase.createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
  global: {
    fetch: (input, init) => undici.fetch(input, { ...init, dispatcher: agent }),
  },
});

module.exports = supabaseclient;