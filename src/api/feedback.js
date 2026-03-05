import request from '@/utils/request'

// Submit feedback V2
export const submitFeedbackV2 = (data) => {
    return request.post('/api/v2/feedback/submit', data)
}

// Get feedback list V2
export const getFeedbackListV2 = (params) => {
    return request.get('/api/v2/feedback/list', { params })
}

// Upload file
export const uploadFile = (data) => {
    return request.post('/api/v1/upload/file', data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

// Get feedback types (optional)
export const getFeedbackTypes = () => {
    return request.get('/api/v1/feedback/types')
}
