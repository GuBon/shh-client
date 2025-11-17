<template>
  <div class="my-store-page">
    <!-- 글로벌 헤더 -->
    <GlobalHeader />

    <!-- 메인 컨텐츠 -->
    <div class="main-content">
      <div class="container">
        <!-- 페이지 헤더 -->
        <div class="page-header">
          <h1 class="page-title">현재 제휴 중인 매장</h1>
          <button @click="showCreateModal = true" class="create-btn">
            <i class="icon-plus">+</i>
          </button>
        </div>

        <!-- 제휴 매장 테이블 -->
        <div class="store-table">
          <!-- 테이블 헤더 -->
          <div class="table-header">
            <div class="header-cell number">번호</div>
            <div class="header-cell name">상대 매장</div>
            <div class="header-cell details">상세 내용</div>
            <div class="header-cell count">차여/전체</div>
          </div>

          <!-- 테이블 바디 -->
          <div class="table-body">
            <div 
              v-for="(store, index) in partnerStores" 
              :key="store.id"
              class="table-row"
            >
              <div class="cell number">{{ index + 1 }}</div>
              <div class="cell name">{{ store.name }}</div>
              <div class="cell details">{{ store.details }}</div>
              <div class="cell count">
                <span class="count-text">{{ store.used }}/{{ store.total }}</span>
              </div>
            </div>

            <!-- 데이터가 없을 때 -->
            <div v-if="partnerStores.length === 0" class="empty-state">
              <p>등록된 제휴 매장이 없습니다.</p>
              <button @click="showCreateModal = true" class="empty-create-btn">
                첫 제휴 매장 등록하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 제휴 매장 등록 모달 -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>제휴 쿠폰 등록</h2>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>

        <form @submit.prevent="createPartnerStore" class="modal-form">
          <div class="form-group">
            <label class="form-label">상대 매장명</label>
            <input
              v-model="newStore.name"
              type="text"
              placeholder="매장명을 입력하세요"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">상세 내용</label>
            <textarea
              v-model="newStore.details"
              placeholder="상세 내용을 입력하세요 (30자 이내)"
              class="form-textarea"
              rows="3"
              maxlength="30"
              required
            ></textarea>
            <div class="char-count">{{ newStore.details.length }}/30</div>
          </div>

          <div class="form-group">
            <label class="form-label">발급 갯수</label>
            <input
              v-model.number="newStore.total"
              type="number"
              placeholder="갯수를 입력하세요"
              class="form-input"
              min="1"
              required
            />
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="cancel-btn">
              취소
            </button>
            <button type="submit" class="submit-btn">
              등록
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import GlobalHeader from '../components/GlobalHeader.vue'

// 상태
const showCreateModal = ref(false)
const partnerStores = ref([])

// 새 매장 폼 데이터
const newStore = reactive({
  name: '',
  details: '',
  total: null
})

// 메서드
const closeModal = () => {
  showCreateModal.value = false
  resetForm()
}

const resetForm = () => {
  newStore.name = ''
  newStore.details = ''
  newStore.total = null
}

const createPartnerStore = () => {
  if (!newStore.name || !newStore.details || !newStore.total) return

  const newId = Math.max(...partnerStores.value.map(s => s.id), 0) + 1
  
  partnerStores.value.push({
    id: newId,
    name: newStore.name,
    details: newStore.details,
    used: 0,
    total: newStore.total
  })

  closeModal()
}
</script>

<style scoped>
.my-store-page {
  min-height: 100vh;
  background: #f8fafc;
}

.main-content {
  padding: 40px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 페이지 헤더 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #111827;
}

.create-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  color: #ff6b35;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.create-btn:hover {
  background: #fff7f5;
  color: #e55a2b;
}

.icon-plus {
  font-size: 24px;
  font-weight: bold;
}

/* 테이블 */
.store-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 80px 200px 1fr 120px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.header-cell {
  padding: 16px;
  font-weight: 600;
  color: #374151;
  text-align: center;
  border-right: 1px solid #e5e7eb;
}

.header-cell:last-child {
  border-right: none;
}

.table-body {
  min-height: 200px;
}

.table-row {
  display: grid;
  grid-template-columns: 80px 200px 1fr 120px;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s;
}

.table-row:hover {
  background: #fafafa;
}

.table-row:last-child {
  border-bottom: none;
}

.cell {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-right: 1px solid #f3f4f6;
  color: #374151;
}

.cell:last-child {
  border-right: none;
}

.cell.number {
  font-weight: 600;
  color: #6b7280;
}

.cell.name {
  font-weight: 500;
}

.count-text {
  font-weight: 600;
  color: #ff6b35;
}

/* 빈 상태 */
.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #6b7280;
}

.empty-state p {
  margin: 0 0 20px;
  font-size: 16px;
}

.empty-create-btn {
  padding: 12px 24px;
  background: #ff6b35;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.empty-create-btn:hover {
  background: #e55a2b;
}

/* 모달 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  margin: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
  margin-bottom: 24px;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 6px;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-form {
  padding: 0 24px 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #ff6b35;
}

.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
  resize: vertical;
  min-height: 80px;
  box-sizing: border-box;
  font-family: inherit;
}

.form-textarea:focus {
  outline: none;
  border-color: #ff6b35;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
}

.cancel-btn {
  padding: 12px 24px;
  border: 2px solid #e5e7eb;
  background: white;
  color: #374151;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.submit-btn {
  padding: 12px 24px;
  background: #ff6b35;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover {
  background: #e55a2b;
}

/* 반응형 */
@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }

  .page-header {
    margin-bottom: 24px;
  }

  .page-title {
    font-size: 20px;
  }

  .table-header,
  .table-row {
    grid-template-columns: 60px 1fr 100px;
  }

  .header-cell.details,
  .cell.details {
    display: none;
  }

  .modal-content {
    margin: 16px;
  }

  .modal-header {
    padding: 20px 20px 0;
  }

  .modal-form {
    padding: 0 20px 20px;
  }
}

/* 다크모드 */
@media (prefers-color-scheme: dark) {
  .my-store-page {
    background: #111827;
  }

  .page-title {
    color: #f9fafb;
  }

  .create-btn {
    color: #ff6b35;
  }

  .create-btn:hover {
    background: #2d1b17;
    color: #e55a2b;
  }

  .store-table {
    background: #1f2937;
  }

  .table-header {
    background: #374151;
  }

  .header-cell {
    color: #e5e7eb;
    border-right-color: #4b5563;
  }

  .table-row {
    border-bottom-color: #374151;
  }

  .table-row:hover {
    background: #374151;
  }

  .cell {
    color: #e5e7eb;
    border-right-color: #374151;
  }

  .cell.number {
    color: #9ca3af;
  }

  .empty-state {
    color: #9ca3af;
  }

  .modal-content {
    background: #1f2937;
  }

  .modal-header h2 {
    color: #f9fafb;
  }

  .form-label {
    color: #e5e7eb;
  }

  .form-input,
  .form-textarea {
    background: #374151;
    border-color: #4b5563;
    color: #e5e7eb;
  }

  .form-input:focus,
  .form-textarea:focus {
    border-color: #ff6b35;
  }

  .char-count {
    color: #9ca3af;
  }

  .cancel-btn {
    background: #374151;
    border-color: #4b5563;
    color: #e5e7eb;
  }

  .cancel-btn:hover {
    background: #4b5563;
    border-color: #6b7280;
  }
}
</style>
