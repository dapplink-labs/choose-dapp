import request from '@/utils/request'




export function getGasFees(
    chain_id
) {
    return request({
        url: "/api/v1/bridge-gas-fee",
        method: "get",
        params: {
            chain_id,
           
        }
    })
}