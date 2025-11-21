// 업종명을 카카오 API 카테고리 코드로 매핑하는 서비스

// 카카오 API 18개 표준 카테고리
export const KAKAO_CATEGORIES = {
  MT1: { name: '대형마트', icon: '🛒' },
  CS2: { name: '편의점', icon: '🏪' },
  PS3: { name: '어린이집, 유치원', icon: '🏫' },
  SC4: { name: '학교', icon: '🎓' },
  AC5: { name: '학원', icon: '📚' },
  PK6: { name: '주차장', icon: '🅿️' },
  OL7: { name: '주유소, 충전소', icon: '⛽' },
  SW8: { name: '지하철역', icon: '🚇' },
  BK9: { name: '은행', icon: '🏦' },
  CT1: { name: '문화시설', icon: '🎭' },
  AG2: { name: '중개업소', icon: '🏠' },
  PO3: { name: '공공기관', icon: '🏢' },
  AT4: { name: '관광명소', icon: '🗺️' },
  AD5: { name: '숙박', icon: '🏨' },
  FD6: { name: '음식점', icon: '🍽️' },
  CE7: { name: '카페', icon: '☕' },
  HP8: { name: '병원', icon: '🏥' },
  PM9: { name: '약국', icon: '💊' }
}

// 업종명 → 카카오 카테고리 매핑
export const INDUSTRY_TO_CATEGORY_MAP = {
  // 음식점 관련 (FD6)
  '분식전문점': ['FD6'],
  '치킨전문점': ['FD6'],
  '한식음식점': ['FD6'],
  '양식음식점': ['FD6'],
  '일식음식점': ['FD6'],
  '중식음식점': ['FD6'],
  '패스트푸드점': ['FD6'],
  '호프-간이주점': ['FD6'],
  '반찬가게': ['FD6', 'MT1'], // 음식점 + 마트

  // 카페/베이커리 관련 (CE7)
  '커피-음료': ['CE7'],
  '제과점': ['CE7', 'FD6'], // 카페 + 음식점
  '커피전문점/카페/다방': ['CE7'],
  '베이커리': ['CE7', 'FD6'],

  // 편의점/마트 관련 (CS2, MT1)
  '편의점': ['CS2'],
  '슈퍼마켓': ['MT1', 'CS2'],
  '미곡판매': ['MT1'],
  '수산물판매': ['MT1'],
  '육류판매': ['MT1'],
  '청과상': ['MT1'],

  // 학원 관련 (AC5)
  '스포츠 강습': ['AC5'],
  '예술학원': ['AC5'],
  '외국어학원': ['AC5'],
  '일반교습학원': ['AC5'],

  // 의료/건강 관련 (HP8)
  '일반의원': ['HP8'],
  '치과의원': ['HP8'],
  '한의원': ['HP8'],
  '피부관리실': ['HP8'],
  '미용실': ['HP8'],
  '네일숍': ['HP8'],

  // 약국 관련 (PM9)
  '의약품': ['PM9'],
  '화장품': ['PM9'],

  // 문화시설 관련 (CT1)
  'PC방': ['CT1'],
  '노래방': ['CT1'],
  '당구장': ['CT1'],

  // 부동산 관련 (AG2)
  '부동산중개업': ['AG2'],

  // 숙박 관련 (AD5)
  '여관': ['AD5'],

  // 기타 업종들 (가장 유사한 카테고리로 매핑)
  '서적': ['CT1'], // 문화시설로 분류
  '문구': ['CT1'],
  '세탁소': ['CS2'], // 편의점과 유사한 생활 서비스
  '스포츠클럽': ['CT1'], // 문화시설로 분류
  '골프연습장': ['CT1'],
  '안경': ['HP8'], // 의료 관련
  '애완동물': ['HP8'], // 동물병원으로 분류
  '전자상거래업': ['CS2'], // 편의점으로 분류
  '가전제품': ['CS2'],
  '가전제품수리': ['CS2'],
  '운동/경기용품': ['CT1'], // 문화시설로 분류
  '인테리어': ['AG2'], // 중개업소와 유사
  '자동차수리': ['OL7'], // 주유소와 유사한 자동차 관련
  '자동차미용': ['OL7'],
  '자전거 및 기타운송장비': ['OL7'],
  '조명용품': ['CS2'],
  '핸드폰': ['CS2'],
  '가구': ['AG2'],
  '가방': ['CS2'],
  '섬유제품': ['CS2'],
  '시계및귀금속': ['CS2'],
  '신발': ['CS2'],
  '의료기기': ['PM9'],
  '일반의류': ['CS2'],
  '완구': ['CS2'],
  '철물점': ['CS2'],
  '컴퓨터및주변장치판매': ['CS2'],
  '화초': ['CS2'],
  '패션/의류': ['CS2'],
  '화장품/향수': ['PM9']
}

// 업종명으로 카테고리 코드 찾기
export const getCategoriesToSearch = (industryNames) => {
  if (!industryNames || !Array.isArray(industryNames)) {
    return []
  }

  const categorySet = new Set()

  industryNames.forEach(industryName => {
    const categories = INDUSTRY_TO_CATEGORY_MAP[industryName]
    if (categories) {
      categories.forEach(category => categorySet.add(category))
    } else {
      // 매핑되지 않은 업종은 기본적으로 편의점(CS2)으로 분류
      console.warn(`매핑되지 않은 업종: ${industryName}, 편의점 카테고리로 검색합니다.`)
      categorySet.add('CS2')
    }
  })

  return Array.from(categorySet)
}

// 카테고리 코드로 이름 가져오기
export const getCategoryName = (categoryCode) => {
  return KAKAO_CATEGORIES[categoryCode]?.name || categoryCode
}

// 카테고리 코드로 아이콘 가져오기
export const getCategoryIcon = (categoryCode) => {
  return KAKAO_CATEGORIES[categoryCode]?.icon || '🏪'
}

// 추천 업종 데이터를 카테고리로 변환
export const convertRecommendationsToCategories = (recommendations) => {
  if (!recommendations?.recommendations) {
    return []
  }

  // 사용자 현재 업종 포함
  const allIndustries = [recommendations.userIndustry]
  
  // 추천 업종들 추가
  // recommendations.recommendations.forEach(rec => {
  //   allIndustries.push(rec.industryName)
  // })

  const categories = getCategoriesToSearch(allIndustries)
  
  console.log('🎯 추천 업종들:', allIndustries)
  console.log('📋 검색할 카테고리들:', categories)

  return categories
}

export default {
  KAKAO_CATEGORIES,
  INDUSTRY_TO_CATEGORY_MAP,
  getCategoriesToSearch,
  getCategoryName,
  getCategoryIcon,
  convertRecommendationsToCategories
}
