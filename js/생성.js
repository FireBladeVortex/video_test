
function 불러오기_노래들(그거)
{
	const 필터_1차 = 그거.노래 ?? []

	const 필터_2차 = 필터_1차
		.filter(노래 => 노래.이름 && 노래.제목 && 노래.시작 && 노래.종료)
		.map(노래 => ({ id: 그거.id, ...노래 }))
	return 필터_2차
}

// (추가) "시작"
// 노래 하나를 받아 [이름 | 제목] 두 칸짜리 줄 요소를 만들어 돌려줍니다
// 칸 너비(200px / 나머지)는 CSS의 .선택지_줄에서 정합니다
function 선택지_줄_만들기(노래)
{
	const 줄 = document.createElement("span")
	줄.className = "선택지_줄"

	const 칸_이름 = document.createElement("span")
	칸_이름.className = "선택지_칸"
	칸_이름.textContent = 노래.이름
	줄.appendChild(칸_이름)

	const 칸_제목 = document.createElement("span")
	칸_제목.className = "선택지_칸"
	칸_제목.textContent = 노래.제목
	줄.appendChild(칸_제목)

	return 줄
}
// (추가) "종료"


function 만들기_부분()
{
	if (!임시_목록.부분)
		return

	const 동영상 = document.querySelector(".구역[data-종류=동영상]")
	const 쇼츠 = document.querySelector(".구역[data-종류=쇼츠]")
	const 구역 = document.querySelector(".구역[data-종류=부분]")
	if (!구역)
		return

	const 부분만 = !동영상 && !쇼츠 && 부분
	if (!부분만)
	{
		const 안내표시줄 = document.createElement("div")
		안내표시줄.className = "안내표시줄"
		구역.appendChild(안내표시줄)

		const 안내 = document.createElement("span")
		안내.className = "안내"
		안내.textContent = "크게 보면 편해요"
		안내표시줄.appendChild(안내)
	}

	const 본문 = document.createElement("section")
	본문.className = "본문"
	구역.appendChild(본문)

	const 선택지_공간 = document.createElement("div")
	선택지_공간.className = "선택지_공간"
	구역.appendChild(선택지_공간)


	function 드롭다운()
	{
		if (!동영상 && !쇼츠)
			return

		const 드롭다운_칸 = document.createElement("div")
		드롭다운_칸.className = "드롭다운_칸"
		선택지_공간.appendChild(드롭다운_칸)

		const 선택지 = document.createElement("select")
		선택지.className = "드롭다운_선택"
		드롭다운_칸.appendChild(선택지)

		// "노래 골라" 안내 (열면 사라지고, 선택 없이 닫으면 다시 보임)
		const 안내 = document.createElement("option")
		안내.value = ""
		안내.textContent = "노래 골라"
		안내.selected = true
		안내.disabled = true
		안내.hidden = true
		선택지.appendChild(안내)

		// option의 value에는 노래_자료의 번호를 넣음
		const 노래_자료 = []
		for (const 그거 of 임시_목록.부분)
		{
			for (const 노래 of 불러오기_노래들(그거))
			{
				const 항목 = document.createElement("option")
				항목.value = 노래_자료.length + ""
				항목.textContent = 노래.이름 + "\t" + 노래.제목
				선택지.appendChild(항목)
				노래_자료.push(노래)
			}
		}

		const 재생 = document.createElement("button")
		재생.className = "재생_시작_버튼"
		재생.textContent = "재생 시작"
		재생.disabled = true
		드롭다운_칸.appendChild(재생)

		// 선택지를 고르면 재생 버튼 활성화
		선택지.addEventListener("change", () =>
		{
			재생.disabled = 선택지.value === ""
		})

		// 선택한 노래의 id, 시작, 종료로 cueVideoById 실행
		재생.addEventListener("click", () =>
		{
			const 노래 = 노래_자료[+선택지.value]
			if (!노래)
				return

			이미지_클릭_강조("드롭다운")
			선택한_동영상_준비(노래.id, 노래.시작, 노래.종료)
		})
	}
	// (추가) "종료"
	// (추가) "시작"
	// 노래를 페이지 형태로 모두 보여주는 목록 (한 줄 = 이름 200px | 제목 | 재생 시작 100px)
	function 만들기_노래_목록()
	{
		// 크기 감지(ResizeObserver)가 .목록 을 감시하므로 클래스를 "목록 부분"으로 지정
		const 목록 = document.createElement("section")
		목록.className = "목록 부분"
		// 작게 화면에서는 시작부터 disable (inert = 클릭, 포커스 모두 차단)
		목록.inert = 구역.dataset.크게 !== "참"
		본문.appendChild(목록)

		const 페이지 = document.createElement("div")
		페이지.className = "페이지 부분"
		목록.appendChild(페이지)

		let 번호 = 0
		for (const 그거 of 임시_목록.부분)
		{
			for (const 노래 of 불러오기_노래들(그거))
			{
				const 몇번 = (번호 + "").padStart(3, "0")
				번호++

				// 페이지_재구성이 data-종류, data-숫자로 보임/숨김을 결정함
				const 항목 = document.createElement("div")
				항목.className = "노래_항목"
				항목.dataset.종류 = "부분"
				항목.dataset.숫자 = 몇번
				페이지.appendChild(항목)

				const 칸_이름 = document.createElement("span")
				칸_이름.className = "노래_칸 노래_이름"
				칸_이름.textContent = 노래.이름
				항목.appendChild(칸_이름)

				const 칸_제목 = document.createElement("span")
				칸_제목.className = "노래_칸 노래_제목"
				칸_제목.textContent = 노래.제목
				항목.appendChild(칸_제목)

				const 칸_재생 = document.createElement("span")
				칸_재생.className = "노래_칸 노래_재생"
				항목.appendChild(칸_재생)

				const 재생 = document.createElement("button")
				재생.className = "재생_시작_버튼"
				재생.textContent = "재생 시작"
				칸_재생.appendChild(재생)

				재생.addEventListener("click", () =>
				{
					이미지_클릭_강조("부분" + 몇번)
					선택한_동영상_준비(노래.id, 노래.시작, 노래.종료)
				})
			}
		}
	}

	// 단독 = 부분 구역만 있는지, 크게 = 지금 큰 화면인지 (CSS와 크기_조절이 이 값을 사용함)
	구역.dataset.단독 = (!동영상 && !쇼츠) ? "참" : "거짓"
	구역.dataset.크게 = 구역.dataset.단독
	드롭다운()
	만들기_노래_목록()

}

