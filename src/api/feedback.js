import request from '@/utils/request'

// Submit feedback
export const submitFeedback = (data) => {
    return request.post('/api/v1/feedback/create', data)
}

// Get feedback list
export const getFeedbackList = (params) => {
    return request.get('/api/v1/feedback/list', { params })
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
