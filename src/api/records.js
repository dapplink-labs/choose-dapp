import axios from "axios"


// bridge records 
// ?address=0x00&page=1&pageSize=50&order=desc
export function getBridgeRecords(page,pageSize,order,address) {
    return axios({
        url: "https://bridge-api-testnet.cpchain.com/api/v1/bridge-records",
        method: "get",
        params: {
            page: page,
            pageSize: pageSize,
            order: order,
            address: address

        }
    })
}
// stake records 
