<template>
    <div class="feedback">
        <div class="feedback-header">
            <div class="feedback-header-left" @click="router.back()">
                <div class="feedback-header-left-icon">
                    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="18" height="20">
                        <path d="M723.2 1024l-512-512L716.8 0l70.4 70.4L345.6 512l441.6 448-64 64z"
                            fill="currentColor" />
                    </svg>
                </div>
            </div>
            <div class="feedback-header-title">
                {{ t("feedback.productFeedback") || "产品反馈" }}
            </div>
            <div class="feedback-header-right" @click="router.push('/feedback-list')">
                <div class="history-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
                            stroke="var(--text-color, #fff)" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                        <path d="M14 2V8H20" stroke="var(--text-color, #fff)" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                        <path d="M16 13H8" stroke="var(--text-color, #fff)" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                        <path d="M16 17H8" stroke="var(--text-color, #fff)" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                        <path d="M10 9H8" stroke="var(--text-color, #fff)" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="feedback-content">
            <div class="form-group">
                <label class="form-label">{{ t("feedback.type") }} <span class="required">*</span></label>
                <div class="custom-select-wrapper">
                    <div class="custom-select-trigger" @click="showTypeSheet = true">
                        <span :class="{ 'placeholder': !formData.type }">
                            {{ selectedTypeName || t('feedback.select') }}
                        </span>
                        <div class="arrow-icon" :class="{ 'is-active': showTypeSheet }">
                            <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="12" height="12">
                                <path
                                    d="M831.872 340.864 512 652.672 192.128 340.864a30.592 30.592 0 0 0-42.752 0 29.12 29.12 0 0 0 0 41.6L489.664 714.24a32 32 0 0 0 44.672 0l340.288-331.712a29.12 29.12 0 0 0 0-41.728 30.592 30.592 0 0 0-42.752 0z"
                                    fill="currentColor"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">{{ t("feedback.content") }} <span class="required">*</span></label>
                <div class="textarea-wrapper">
                    <textarea v-model="formData.content" class="custom-textarea"
                        :placeholder="t('feedback.contentPlaceholder')" maxlength="500"></textarea>
                </div>
                <span class="char-count">{{ formData.content.length }}/500</span>
            </div>

            <div class="form-group">
                <label class="form-label">{{ t("feedback.attachment") }}</label>
                <p class="upload-tip">{{ t("feedback.attachmentTip") }}</p>

                <div class="upload-grid">
                    <div class="upload-item" v-for="(file, index) in fileList" :key="index">
                        <img v-if="file.type === 'image'" :src="file.url" class="preview-img" />
                        <video v-else :src="file.url" class="preview-video"></video>
                        <div class="delete-btn" @click="removeFile(index)">×</div>
                    </div>

                    <div class="upload-btn" @click="triggerUpload" v-if="fileList.length < 6">
                        <span class="plus">+</span>
                        <input type="file" ref="fileInput" style="display: none" accept="image/*,video/*" multiple
                            @change="handleFileChange" />
                    </div>
                </div>
            </div>
        </div>

        <div class="feedback-footer">
            <button class="submit-btn" @click="handleSubmit" :disabled="!isFormValid || submitting">
                {{ submitting ? t("feedback.submitting") : t("feedback.submit") }}
            </button>
            <p class="footer-tip">{{ t("feedback.footerTip") }}</p>
        </div>

        <el-drawer v-model="showTypeSheet" direction="btt" :with-header="false" size="45%" class="type-drawer"
            :show-close="false">
            <div class="type-sheet">
                <div class="type-sheet-header">
                    <div class="type-sheet-title">{{ t("feedback.type") }}</div>
                    <div class="type-sheet-close" @click="showTypeSheet = false">
                        <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                            <path
                                d="M512 452.267l226.133-226.134a42.667 42.667 0 0 1 60.334 60.334L572.267 512l226.2 226.133a42.667 42.667 0 0 1-60.333 60.334L512 572.267l-226.133 226.2a42.667 42.667 0 0 1-60.334-60.334L451.733 512 225.533 285.867a42.667 42.667 0 0 1 60.334-60.334L512 451.733z"
                                fill="currentColor"></path>
                        </svg>
                    </div>
                </div>
                <div class="type-list">
                    <div v-for="item in feedbackTypes" :key="item.code" class="type-item"
                        :class="{ active: formData.type === item.code }" @click="selectType(item.code)">
                        <div class="type-name">{{ item.name }}</div>
                        <div class="type-check" v-if="formData.type === item.code">
                            <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                                <path
                                    d="M384 723.2 166.4 505.6a42.667 42.667 0 0 0-60.33 60.33l248 248a42.667 42.667 0 0 0 60.33 0l512-512a42.667 42.667 0 0 0-60.33-60.33L384 723.2z"
                                    fill="currentColor"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </el-drawer>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useI18n } from "vue-i18n"
import { submitFeedbackV2, uploadFile, getFeedbackTypesV2 } from "@/api/feedback"
import { ElMessage } from "element-plus"
import { useAccount } from '@wagmi/vue'

const router = useRouter()
const { t, locale } = useI18n()
const { address } = useAccount()
const fileInput = ref(null)

const formData = reactive({
    type: '',
    content: ''
})

const feedbackTypes = ref([])

onMounted(async () => {
    try {
        const lang = (locale.value || 'zh-cn').toLowerCase()
        const res = await getFeedbackTypesV2({ language_code: lang })
        if (res.data && res.data.success) {
            feedbackTypes.value = res.data.data
        }
    } catch (error) {
        console.error('Failed to fetch feedback types:', error)
    }
})

const fileList = ref([])
const submitting = ref(false)
const showTypeSheet = ref(false)
const selectedTypeName = computed(() => {
    const found = feedbackTypes.value.find(item => item.code === formData.type)
    return found ? found.name : ''
})

const selectType = (code) => {
    formData.type = code
    showTypeSheet.value = false
}

const isFormValid = computed(() => {
    return formData.type && formData.content
})

const triggerUpload = () => {
    fileInput.value.click()
}

const handleFileChange = async (event) => {
    const files = Array.from(event.target.files)
    if (!files.length) return

    if (fileList.value.length + files.length > 6) {
        ElMessage.warning(t('feedback.msgMaxFile'))
        return
    }

    for (const file of files) {
        const isImage = file.type.startsWith('image/')
        const isVideo = file.type.startsWith('video/')

        if (!isImage && !isVideo) {
            ElMessage.warning(t('feedback.msgInvalidFormat'))
            continue
        }

        // Create local preview URL
        const url = URL.createObjectURL(file)

        // TODO: Implement actual file upload to server here if needed
        // For now we just store the file object and local URL

        fileList.value.push({
            file,
            url,
            type: isImage ? 'image' : 'video'
        })
    }

    // Reset input
    event.target.value = ''
}

const removeFile = (index) => {
    URL.revokeObjectURL(fileList.value[index].url)
    fileList.value.splice(index, 1)
}

const handleSubmit = async () => {
    if (!formData.type) {
        ElMessage.warning(t('feedback.msgSelectType'))
        return
    }
    if (!formData.content) {
        ElMessage.warning(t('feedback.msgInputContent'))
        return
    }

    submitting.value = true
    try {
        const uploadedUrls = []
        if (fileList.value.length > 0) {
            for (const item of fileList.value) {
                const fd = new FormData()
                fd.append('file', item.file)
                const res = await uploadFile(fd)
                if (res.data && res.data.success && res.data.data && res.data.data.url) {
                    uploadedUrls.push(res.data.data.url)
                }
            }
        }

        const payload = {
            content: formData.content,
            feedback_type: formData.type,
            image_urls: uploadedUrls,
            user_address: address.value || ''
        }

        const res = await submitFeedbackV2(payload)
        if (res.data && res.data.success) {
            ElMessage.success(t('feedback.msgSubmitSuccess'))

            // Clear form
            formData.type = ''
            formData.content = ''
            fileList.value = []

            // Go to list
            router.push('/feedback-list')
        } else {
            ElMessage.error(res.data?.message || t('feedback.msgSubmitFail'))
        }
    } catch (error) {
        console.error(error)
        ElMessage.error(t('feedback.msgSubmitFail'))
    } finally {
        submitting.value = false
    }
}
</script>

<style scoped lang="scss">
.feedback {
    min-height: 100vh;
    background-color: var(--bg-color-010101, #010101);
    color: #fff;
    display: flex;
    flex-direction: column;
}

.feedback-header {
    height: 56px;
    background-color: var(--bg-color-010101, #010101);
    display: flex;
    align-items: center;
    justify-content: space-between;
    // padding: 0 16px;
    position: sticky;
    top: 0;
    z-index: 10;
}

.feedback-header-left,
.feedback-header-right {
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.feedback-header-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-color, #fff);
}

.feedback-header-left-icon {
    display: flex;
    align-items: center;
    justify-content: center;
}

.feedback-header-left-icon svg {
    color: var(--text-color, #fff);

}

.history-icon svg {
    color: var(--text-color, #fff);
}

.feedback-content {
    padding: 20px 16px;
    flex: 1;
}

.form-group {
    margin-bottom: 24px;
    position: relative;
}

.form-label {
    display: block;
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 12px;
    color: var(--text-color, #fff);

    .required {
        color: #ff4d4f;
        margin-left: 4px;
    }
}

.custom-select-wrapper {
    position: relative;
}

.custom-select-trigger {
    width: 100%;
    box-shadow: 0 0 0 1px #333 inset;
    border-radius: 8px;
    height: 48px;
    padding: 0 16px;
    background-color: transparent;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    color: var(--text-color, #fff);
    box-sizing: border-box;

    .placeholder {
        color: #666;
    }

    .arrow-icon {
        color: #666;
        display: flex;
        align-items: center;
        transition: transform 0.3s;

        &.is-active {
            transform: rotate(180deg);
        }
    }
}

:deep(.type-drawer) {
    background-color: var(--bg-color-010101, #1a1a1a) !important;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;

    .el-drawer__body {
        padding: 0;
        background-color: transparent;
    }
}

.type-sheet {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: 70vh;
}

.type-sheet-header {
    height: 56px;
    display: flex;
    align-items: center;
    // justify-content: center;
    position: relative;
    // border-bottom: 1px solid #333;
    flex-shrink: 0;
    padding-left: 16px;

    .type-sheet-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-color, #fff);
    }

    .type-sheet-close {
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
        cursor: pointer;
        color: #999;
        display: flex;
        align-items: center;
    }
}

.type-list {
    flex: 1;
    overflow-y: auto;
    padding: 0;
}

.type-item {
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    font-size: 16px;
    color: var(--text-color, #fff);
    cursor: pointer;

    &:last-child {
        border-bottom: none;
    }

    &.active {
        background-color: var(--text-dark-gray, #222);
    }



    .type-check {
        // color: #2ecc71;
        display: flex;
        align-items: center;
    }
}

.textarea-wrapper {
    position: relative;
    border-radius: 8px;
    border: 1px solid #333;
}

.custom-textarea {
    width: 100%;
    height: 160px;
    background: transparent;
    border: none;
    color: var(--text-color, #fff);
    padding: 16px;
    resize: none;
    font-size: 14px;
    outline: none;
    box-sizing: border-box;

    &::placeholder {
        color: #666;
    }
}

.char-count {
    position: absolute;
    right: 16px;
    font-size: 12px;
    color: #666;
}

.upload-tip {
    font-size: 12px;
    color: #666;
    margin-bottom: 12px;
}

.upload-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.upload-item,
.upload-btn {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    position: relative;
    overflow: hidden;
}

.upload-item {

    .preview-img,
    .preview-video {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .delete-btn {
        position: absolute;
        top: 0;
        right: 0;
        width: 20px;
        height: 20px;
        background: rgba(0, 0, 0, 0.5);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        cursor: pointer;
    }
}

.upload-btn {
    margin-top: 1px;
    border: 1px dashed #333;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    .plus {
        font-size: 24px;
        color: #666;
    }
}

.feedback-footer {
    padding: 20px 16px;
    background-color: var(--bg-color-010101, #010101);
}

.submit-btn {
    width: 100%;
    height: 50px;
    background: var(--el-menu-text-color, #010101);
    border: none;
    border-radius: 8px;
    color: var(--bg-color-010101, #010101);
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 16px;
    transition: all 0.3s ease;

    &:disabled {
        background: #2F2F2F;
        color: #888;
        cursor: not-allowed;
        opacity: 1;
    }
}

.footer-tip {
    font-size: 12px;
    color: #666;
    text-align: left;
}
</style>
