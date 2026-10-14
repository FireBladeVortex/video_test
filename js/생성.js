


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

	const 구역 = document.querySelector(".구역[data-종류=부분]")
	if (!구역)
		return

	const 선택지_공간 = document.createElement("div")
	선택지_공간.className = "선택지_공간"
	구역.appendChild(선택지_공간)


// (수정) "시작"
// select 대신 div 안에 버튼과 ul을 만듭니다 (27번 예제 구조)
		const 선택지_노래 = document.createElement("div")
		선택지_노래.className = "선택지_노래"
		선택지_공간.appendChild(선택지_노래)

			// 닫혀 있을 때 보이는 버튼 (안내 문구 또는 선택한 줄이 들어감)
			const 선택지_버튼 = document.createElement("button")
			선택지_버튼.className = "선택지_버튼"
			선택지_노래.appendChild(선택지_버튼)

				const 선택지_안내 = document.createElement("span")
				선택지_안내.className = "선택지_안내"
				선택지_안내.textContent = "듣고 싶은 노래를 선택하세요"
				선택지_버튼.appendChild(선택지_안내)

			// 펼쳐지는 목록
			const 선택지_목록 = document.createElement("ul")
			선택지_목록.className = "선택지_목록"
			선택지_노래.appendChild(선택지_목록)
// (수정) "종료"


		// const 선택지_노래 = document.createElement("select")
		// 선택지_노래.className = "선택지_노래"
		// 선택지_공간.appendChild(선택지_노래)

		// 	const 설정 = document.createElement("option")
		// 	설정.value = ""
		// 	설정.textContent = "듣고 싶은 노래를 선택하세요"
		// 	설정.selected = true
		// 	설정.disabled = true
		// 	설정.hidden = true
		// 	선택지_노래.appendChild(설정)

		const 선택지_재생 = document.createElement("div")
		선택지_재생.className = "선택지_재생"
		선택지_공간.appendChild(선택지_재생)

			const 재생_준비_버튼 = document.createElement("button")
			재생_준비_버튼.className = "재생_준비_버튼"
			재생_준비_버튼.textContent = "재생 준비"
			선택지_재생.appendChild(재생_준비_버튼)
			재생_준비_버튼.disabled = true


// (수정) "시작"
// 비어 있던 반복문을 채웁니다 (임시목록 오타도 임시_목록으로 고침)
	// 선택한 노래를 기억해 두었다가 재생 버튼에서 사용합니다
	let 선택된_노래 = null

	for (const 동영상 of 임시_목록.부분)
	{
		for (const 노래 of 불러오기_노래들(동영상))
		{
			// li 하나가 노래 하나입니다
			const 항목 = document.createElement("li")
			항목.className = "선택지_항목"
			항목.appendChild(선택지_줄_만들기(노래))

			항목.addEventListener("click", () =>
			{
				// 버튼 안을 비우고 같은 모양의 줄을 새로 만들어 넣습니다
				선택지_버튼.replaceChildren(선택지_줄_만들기(노래))
				선택지_노래.classList.remove("열림")
				선택된_노래 = 노래
				재생_준비_버튼.disabled = false
			})

			선택지_목록.appendChild(항목)
		}
	}
// (수정) "종료"

// (추가) "시작"
// 버튼을 누르면 목록을 열고 닫습니다
	선택지_버튼.addEventListener("click", () =>
	{
		선택지_노래.classList.toggle("열림")
	})

	// 바깥을 클릭하면 닫습니다
	document.addEventListener("click", 그거 =>
	{
		if (!선택지_노래.contains(그거.target))
			선택지_노래.classList.remove("열림")
	})
// (추가) "종료"















	// const 노래들 = new Set()
	// for (const 동영상 of 임시목록.부분)
	// {
	// 	for (const 노래 of 불러오기_노래들(동영상))
	// 	{

	// 	}
	// }

	// // lang, name 값에 맞는 title 목록 갱신 (name 선택 시에만 등장)
	// function update_title()
	// {
	// 	재생_준비_버튼.disabled = true
	// 	const lang_value = 선택지_언어.value
	// 	const name_value = 선택지_이름.value

	// 	선택지_제목.innerHTML = ""
	// 	make_option(선택지_제목, "", "제목", true)

	// 	if (!name_value)
	// 		return // name 기본값이면 목록 비움

	// 	const 제목들 = new Set()

	// 	for (const 동영상 of 임시_목록.부분)
	// 	{
	// 		for (const 노래 of 불러오기_노래들(동영상))
	// 		{
	// 			if (!노래.언어)
	// 				continue // id만 가진 항목은 제외
	// 			const lang_match = !lang_value || 노래.언어.includes(lang_value) // (수정) === → includes
	// 			const name_match = 노래.이름 === name_value
	// 			if (lang_match && name_match)
	// 			{
	// 				제목들.add(노래.제목)
	// 			}
	// 		}
	// 	}


	// 	for (const 제목 of 제목들)
	// 	{
	// 		make_option(선택지_제목, 제목, 제목)
	// 	}
	// }

	// 선택지_언어.addEventListener("change", () =>
	// {
	// 	update_name()
	// 	update_title()
	// })

	// 선택지_이름.addEventListener("change", update_title)

	// 선택지_제목.addEventListener("change", () =>
	// {
	// 	재생_준비_버튼.disabled = !선택지_제목.value
	// })

	// 재생_준비_버튼.addEventListener("click", () =>
	// {
	// 	const target = "재생_준비_버튼"
	// 	{
	// 		이미지_클릭_강조(target)
	// 		const lang_value = 선택지_언어.value
	// 		const name_value = 선택지_이름.value
	// 		const title_value = 선택지_제목.value

	// 		let song = null
	// 		for (const 노래들 of 임시_목록.부분)
	// 		{
	// 			const found = 불러오기_노래들(노래들).find(노래 =>
	// 				노래.언어 && // id만 가진 항목은 제외
	// 				(!lang_value || 노래.언어.includes(lang_value)) &&
	// 				노래.이름 === name_value &&
	// 				노래.제목 === title_value
	// 			)
	// 			if (found)
	// 			{
	// 				song = found
	// 				break
	// 			}
	// 		}

	// 		if (song)
	// 		{
	// 			ready_data(song.id, song.시작, song.종료)
	// 		}
	// 	}
	// })

	// update_name()


	// (추가) "시작"
// 선택한 노래가 있으면 해당 구간을 재생 준비합니다
	재생_준비_버튼.addEventListener("click", () =>
	{
		if (!선택된_노래)
			return

		이미지_클릭_강조("재생_준비_버튼")
		// 명령.js의 함수를 사용합니다 (옛 ready_data 대체)
		선택한_동영상_준비(선택된_노래.id, 선택된_노래.시작, 선택된_노래.종료)
	})
// (추가) "종료"










}














// `select`는 option 안에 칸을 나눌 수 없어서, 27번 예제와 같은 **button + ul/li 방식**으로 바꿉니다. 한 줄이 `[이름 200px | 제목 나머지]`이고 오른쪽에 재생 버튼 100px이 붙습니다.

// 이 드롭다운은 화면 맨 아래 구역에 있어서 **목록이 위로 열리게** 했습니다. 아래로 열면 화면 밖으로 나갑니다.

// ## 전체 순서

// 1. `select`를 버튼과 목록(ul)로 교체합니다.
// 2. 한 줄(이름 칸 + 제목 칸)을 만드는 함수를 추가합니다.
// 3. 노래마다 li를 만들어 목록에 채우고, 열기/닫기/선택을 연결합니다.
// 4. 더 이상 쓰지 않는 옛 `select` 코드를 삭제합니다.
// 5. 재생 버튼 클릭 동작을 새 방식으로 추가합니다.
// 6. CSS로 크기와 구분선을 잡습니다.
// 7. 연결할 부분을 마무리합니다.

// ## 1. 요청: select를 버튼 + 목록으로 교체

// 파일: `js/생성.js`
// 위치: `만들기_부분()` 함수 안, `선택지_공간`을 만든 직후 (`select`와 `설정` option을 만들던 자리)

// ```js
// // (수정) "시작"
// // select 대신 div 안에 버튼과 ul을 만듭니다 (27번 예제 구조)
// 		const 선택지_노래 = document.createElement("div")
// 		선택지_노래.className = "선택지_노래"
// 		선택지_공간.appendChild(선택지_노래)

// 			// 닫혀 있을 때 보이는 버튼 (안내 문구 또는 선택한 줄이 들어감)
// 			const 선택지_버튼 = document.createElement("button")
// 			선택지_버튼.className = "선택지_버튼"
// 			선택지_노래.appendChild(선택지_버튼)

// 				const 선택지_안내 = document.createElement("span")
// 				선택지_안내.className = "선택지_안내"
// 				선택지_안내.textContent = "듣고 싶은 노래를 선택하세요"
// 				선택지_버튼.appendChild(선택지_안내)

// 			// 펼쳐지는 목록
// 			const 선택지_목록 = document.createElement("ul")
// 			선택지_목록.className = "선택지_목록"
// 			선택지_노래.appendChild(선택지_목록)
// // (수정) "종료"

// /*
// 		const 선택지_노래 = document.createElement("select")
// 		선택지_노래.className = "선택지_노래"
// 		선택지_공간.appendChild(선택지_노래)

// 			const 설정 = document.createElement("option")
// 			설정.value = ""
// 			설정.textContent = "듣고 싶은 노래를 선택하세요"
// 			설정.selected = true
// 			설정.disabled = true
// 			설정.hidden = true
// 			선택지_노래.appendChild(설정)
// */
// // 삭제
// ```

// `선택지_재생`과 `재생_준비_버튼`을 만드는 코드는 그대로 둡니다.

// ## 2. 요청: 한 줄(이름 칸 + 제목 칸) 만드는 함수

// 파일: `js/생성.js`
// 위치: `불러오기_노래들()` 함수 바로 아래, `만들기_부분()` 위

// ```js
// // (추가) "시작"
// // 노래 하나를 받아 [이름 | 제목] 두 칸짜리 줄 요소를 만들어 돌려줍니다
// // 칸 너비(200px / 나머지)는 CSS의 .선택지_줄에서 정합니다
// function 선택지_줄_만들기(노래)
// {
// 	const 줄 = document.createElement("span")
// 	줄.className = "선택지_줄"

// 	const 칸_이름 = document.createElement("span")
// 	칸_이름.className = "선택지_칸"
// 	칸_이름.textContent = 노래.이름
// 	줄.appendChild(칸_이름)

// 	const 칸_제목 = document.createElement("span")
// 	칸_제목.className = "선택지_칸"
// 	칸_제목.textContent = 노래.제목
// 	줄.appendChild(칸_제목)

// 	return 줄
// }
// // (추가) "종료"
// ```

// 목록(li) 안과 버튼 안에서 **같은 함수**를 쓰기 때문에, 선택한 뒤에도 칸 너비와 세로선이 똑같이 유지됩니다.

// ## 3. 요청: 목록 채우기, 열기/닫기, 선택 처리

// 파일: `js/생성.js`
// 위치: `만들기_부분()` 함수 안, 비어 있던 `const 노래들 = new Set()` 반복문 자리

// ```js
// // (수정) "시작"
// // 비어 있던 반복문을 채웁니다 (임시목록 오타도 임시_목록으로 고침)
// 	// 선택한 노래를 기억해 두었다가 재생 버튼에서 사용합니다
// 	let 선택된_노래 = null

// 	for (const 동영상 of 임시_목록.부분)
// 	{
// 		for (const 노래 of 불러오기_노래들(동영상))
// 		{
// 			// li 하나가 노래 하나입니다
// 			const 항목 = document.createElement("li")
// 			항목.className = "선택지_항목"
// 			항목.appendChild(선택지_줄_만들기(노래))

// 			항목.addEventListener("click", () =>
// 			{
// 				// 버튼 안을 비우고 같은 모양의 줄을 새로 만들어 넣습니다
// 				선택지_버튼.replaceChildren(선택지_줄_만들기(노래))
// 				선택지_노래.classList.remove("열림")
// 				선택된_노래 = 노래
// 				재생_준비_버튼.disabled = false
// 			})

// 			선택지_목록.appendChild(항목)
// 		}
// 	}
// // (수정) "종료"

// // (추가) "시작"
// // 버튼을 누르면 목록을 열고 닫습니다
// 	선택지_버튼.addEventListener("click", () =>
// 	{
// 		선택지_노래.classList.toggle("열림")
// 	})

// 	// 바깥을 클릭하면 닫습니다
// 	document.addEventListener("click", 그거 =>
// 	{
// 		if (!선택지_노래.contains(그거.target))
// 			선택지_노래.classList.remove("열림")
// 	})
// // (추가) "종료"

// /*
// 	const 노래들 = new Set()
// 	for (const 동영상 of 임시목록.부분)
// 	{
// 		for (const 노래 of 불러오기_노래들(동영상))
// 		{

// 		}
// 	}
// */
// // 삭제
// ```

// - `const 노래`가 반복마다 새로 만들어지므로, 클릭한 li에 맞는 노래가 정확히 `선택된_노래`에 들어갑니다.
// - 재생 버튼은 처음에 `disabled = true`이고, 노래를 고르면 활성화됩니다.

// ## 4. 요청: 쓰지 않는 옛 select 코드 삭제

// 파일: `js/생성.js`
// 위치: `만들기_부분()` 함수 안, `// lang, name 값에 맞는 title 목록 갱신` 줄부터 함수 맨 끝 `update_name()`까지

// 이 코드는 `선택지_언어`, `선택지_이름`, `선택지_제목`이라는 없는 변수를 쓰고 있어서 그대로 두면 `ReferenceError`가 납니다. 재생 버튼 클릭 부분은 5번에서 새로 추가합니다.

// ```js
// /*
// 	// lang, name 값에 맞는 title 목록 갱신 (name 선택 시에만 등장)
// 	function update_title()
// 	{
// 		재생_준비_버튼.disabled = true
// 		const lang_value = 선택지_언어.value
// 		const name_value = 선택지_이름.value

// 		선택지_제목.innerHTML = ""
// 		make_option(선택지_제목, "", "제목", true)

// 		if (!name_value)
// 			return // name 기본값이면 목록 비움

// 		const 제목들 = new Set()

// 		for (const 동영상 of 임시_목록.부분)
// 		{
// 			for (const 노래 of 불러오기_노래들(동영상))
// 			{
// 				if (!노래.언어)
// 					continue // id만 가진 항목은 제외
// 				const lang_match = !lang_value || 노래.언어.includes(lang_value) // (수정) === → includes
// 				const name_match = 노래.이름 === name_value
// 				if (lang_match && name_match)
// 				{
// 					제목들.add(노래.제목)
// 				}
// 			}
// 		}


// 		for (const 제목 of 제목들)
// 		{
// 			make_option(선택지_제목, 제목, 제목)
// 		}
// 	}

// 	선택지_언어.addEventListener("change", () =>
// 	{
// 		update_name()
// 		update_title()
// 	})

// 	선택지_이름.addEventListener("change", update_title)

// 	선택지_제목.addEventListener("change", () =>
// 	{
// 		재생_준비_버튼.disabled = !선택지_제목.value
// 	})

// 	재생_준비_버튼.addEventListener("click", () =>
// 	{
// 		const target = "재생_준비_버튼"
// 		{
// 			이미지_클릭_강조(target)
// 			const lang_value = 선택지_언어.value
// 			const name_value = 선택지_이름.value
// 			const title_value = 선택지_제목.value

// 			let song = null
// 			for (const 노래들 of 임시_목록.부분)
// 			{
// 				const found = 불러오기_노래들(노래들).find(노래 =>
// 					노래.언어 && // id만 가진 항목은 제외
// 					(!lang_value || 노래.언어.includes(lang_value)) &&
// 					노래.이름 === name_value &&
// 					노래.제목 === title_value
// 				)
// 				if (found)
// 				{
// 					song = found
// 					break
// 				}
// 			}

// 			if (song)
// 			{
// 				ready_data(song.id, song.시작, song.종료)
// 			}
// 		}
// 	})

// 	update_name()
// */
// // 삭제
// ```

// ## 5. 요청: 재생 버튼 클릭 동작 추가

// 파일: `js/생성.js`
// 위치: `만들기_부분()` 함수 맨 끝 (4번에서 삭제한 자리)

// ```js
// // (추가) "시작"
// // 선택한 노래가 있으면 해당 구간을 재생 준비합니다
// 	재생_준비_버튼.addEventListener("click", () =>
// 	{
// 		if (!선택된_노래)
// 			return

// 		이미지_클릭_강조("재생_준비_버튼")
// 		// 명령.js의 함수를 사용합니다 (옛 ready_data 대체)
// 		선택한_동영상_준비(선택된_노래.id, 선택된_노래.시작, 선택된_노래.종료)
// 	})
// // (추가) "종료"
// ```

// ## 6. 요청: CSS (너비 200px / 100px / 나머지, 구분선)

// 파일: `css/화면.css`
// 위치: 기존 `.선택지_공간`, `.선택지_공간 .선택지_노래`, `.선택지_공간 .선택지_재생` 규칙 자리

// ```css
// /* (수정) "시작" */
// /* 목록이 위로 펼쳐질 때 잘리지 않도록 overflow를 풀고, 높이는 내용만큼만 차지하게 합니다 */
// .선택지_공간
// {
// 	display : flex ;
// 	width : 80% ;
// 	gap : 3px ;
// 	flex : 0 0 auto ;
// 	overflow : visible ;
// }

// /* 선택지 전체 (재생 버튼과 100px을 뺀 나머지 공간을 모두 차지) */
// .선택지_공간 .선택지_노래
// {
// 	position : relative ;
// 	flex : 1 ;
// 	min-width : 0 ;
// 	overflow : visible ;
// }

// /* 재생 버튼 칸 가로 100px 고정 */
// .선택지_공간 .선택지_재생
// {
// 	display : flex ;
// 	flex : 0 0 100px ;
// 	width : 100px ;
// }

// /* 부분 구역도 목록이 밖으로 나올 수 있게 overflow를 풉니다 */
// .구역[data-종류=부분]
// {
// 	overflow : visible ;
// }
// /* (수정) "종료" */

// /*
// .선택지_공간
// {
// 	display : flex ;
// 	width : 80% ;
// 	gap : 3px ;
// 	flex : 1 ;
// }

// .선택지_공간 .선택지_노래
// {
// 	flex : 5 ;
// 	text-align : left ;
// }

// .선택지_공간 .선택지_재생
// {
// 	display : flex ;
// 	flex : 1 ;
// }
// */
// /* 삭제 */
// ```

// 파일: `css/화면.css`
// 위치: 위 규칙 바로 아래

// ```css
// /* (추가) "시작" */
// /* 닫혀 있을 때 보이는 버튼 */
// .선택지_버튼
// {
// 	width : 100% ;
// 	border : 1px solid var(--강조2) ;
// 	background : var(--왼쪽바탕색) ;
// 	cursor : pointer ;
// 	text-align : left ;
// }

// .선택지_안내
// {
// 	display : block ;
// 	padding : 8px 10px ;
// 	opacity : 0.6 ;
// }

// /* 펼쳐지는 목록 (bottom : 100% 이므로 버튼 위로 열림) */
// .선택지_목록
// {
// 	display : none ;
// 	position : absolute ;
// 	bottom : 100% ;
// 	left : 0 ;
// 	right : 0 ;
// 	z-index : 5 ;
// 	list-style : none ;
// 	border : 1px solid var(--강조2) ;
// 	background : var(--왼쪽바탕색) ;
// 	max-height : 200px ;
// 	overflow-y : auto ;
// }

// .선택지_노래.열림 .선택지_목록
// {
// 	display : block ;
// }

// /* 열면 안내 문구만 숨기고 버튼 높이는 유지 */
// .선택지_노래.열림 .선택지_안내
// {
// 	visibility : hidden ;
// }

// .선택지_항목
// {
// 	position : relative ;
// 	cursor : pointer ;
// }

// .선택지_항목:hover
// {
// 	background : rgba(255, 255, 255, 0.15) ;
// }

// /* 한 줄 : 이름 칸 200px + 제목 칸 나머지 */
// .선택지_줄
// {
// 	display : grid ;
// 	grid-template-columns : 200px 1fr ;
// 	width : 100% ;
// }

// .선택지_칸
// {
// 	position : relative ;
// 	padding : 8px 10px ;
// 	text-align : left ;
// 	white-space : nowrap ;
// 	text-overflow : ellipsis ;
// }

// /* 가로선 : 두 번째 줄부터 맨 위에 너비 90% */
// .선택지_항목 + .선택지_항목::before
// {
// 	content : "" ;
// 	position : absolute ;
// 	top : 0 ;
// 	left : 5% ;
// 	width : 90% ;
// 	height : 1px ;
// 	background : var(--강조2) ;
// }

// /* 세로선 : 두 번째 칸(제목)의 왼쪽에 높이 80% */
// .선택지_칸 + .선택지_칸::before
// {
// 	content : "" ;
// 	position : absolute ;
// 	left : 0 ;
// 	top : 10% ;
// 	height : 80% ;
// 	width : 1px ;
// 	background : var(--강조2) ;
// }
// /* (추가) "종료" */
// ```

// - `grid-template-columns : 200px 1fr`에서 `200px`이 이름 칸이고, `1fr`이 남은 공간 전부를 차지하는 제목 칸입니다.
// - 화면.css 맨 위의 `* { overflow : hidden ; background : transparent }` 때문에 `.선택지_목록`에 `overflow-y : auto`와 `background`를 따로 지정했습니다.
// - 구분선 색은 이 프로젝트의 `--강조2`를 썼습니다. 27번 예제의 회색은 어두운 배경에서 잘 안 보입니다.

// ## 7. 요청: 연결 마무리

// 파일: `js/명령.js`
// 위치: `만들기_목록()` 함수 안, `if (분류.종류 === "부분")` 블록

// ```js
// 		if (분류.종류 === "부분")
// 		{
// 			// (수정)
// 			// 주석을 풀어서 새 선택지가 만들어지게 합니다
// 			만들기_부분()
// 			continue
// 		}
// ```

// 파일: `js/명령.js`
// 위치: `드르륵()` 함수 맨 앞

// ```js
// function 드르륵(마우스휠)
// {
// 	// (추가) "시작"
// 	// 선택지 목록 위에서는 스크롤을 허용하고 소리 조절을 하지 않습니다
// 	if (마우스휠.target.closest(".선택지_목록"))
// 		return
// 	// (추가) "종료"

// 	마우스휠.preventDefault()
// 	소리_크기_값_조절(마우스휠.deltaY < 0 ? +5 : -5)
// }
// ```

// 이 수정이 없으면 목록 위에서 마우스 휠을 굴릴 때 스크롤이 막히고 소리 크기만 바뀝니다.

// ## 참고

// 현재 `명령.js`의 `만들기_기초()`는 `분류`라는 변수를 쓰는데, 이 변수는 `만들기_목록()`의 반복문 안에서만 선언되어 있어서 그 함수에서는 접근할 수 없습니다. 7번을 적용했을 때 오류가 나면 이 부분이 원인일 가능성이 큽니다. 필요하면 해당 부분 수정도 따로 정리해 드리겠습니다.



