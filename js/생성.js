


function 불러오기_노래들(그거)
{
	const 필터_1차 = 그거.노래 ?? []

	const 필터_2차 = 필터_1차
		.filter(노래 => 노래.언어 && 노래.이름 && 노래.제목 && 노래.시작 && 노래.종료)
		.map(노래 => ({ id: 그거.id, ...노래 }))
	return 필터_2차
}




function 만들기_부분()
{
	if (!임시_목록.부분)
		return

	const 구역 = document.querySelector(".구역[data-종류=부분]")
	if (!구역)
		return

	// 1행 (3칸, 1:3:1)
	const 선택지_공간 = document.createElement("div")
	선택지_공간.className = "선택지_공간"
	구역.appendChild(선택지_공간)

	const 선택지_언어 = document.createElement("select")
	선택지_언어.className = "선택지_언어"
	선택지_공간.appendChild(선택지_언어)

	const 선택지_이름 = document.createElement("select")
	선택지_이름.className = "선택지_이름"
	선택지_공간.appendChild(선택지_이름)

	const 선택지_제목 = document.createElement("select")
	선택지_제목.className = "선택지_제목"
	선택지_공간.appendChild(선택지_제목)

	const 선택지_재생 = document.createElement("div")
	선택지_재생.className = "선택지_재생"
	선택지_공간.appendChild(선택지_재생)

	const 재생_준비_버튼 = document.createElement("button")
	재생_준비_버튼.className = "재생_준비_버튼"
	재생_준비_버튼.textContent = "재생 준비"
	선택지_재생.appendChild(재생_준비_버튼)
	재생_준비_버튼.disabled = true


	function make_option(select, value, text, selected = false)
	{
		const option = document.createElement("option")
		option.value = value
		option.textContent = text
		if (selected)
		{
			option.selected = true
			option.disabled = true
			option.hidden = true
		}
		select.appendChild(option)
	}

	make_option(선택지_언어, "", "언어", true)
	const 언어_목록 = ["한국어", "영어", "일본어", "외국어", "개사"]
	for (const 언어 of 언어_목록)
	{
		make_option(선택지_언어, 언어, 언어)
	}

	make_option(선택지_이름, "", "부른 사람", true)
	make_option(선택지_제목, "", "제목", true)

	// lang 값에 맞는 name 목록 갱신
	function update_name()
	{
		const lang_value = 선택지_언어.value
		const 이름들 = new Set()

		for (const 동영상 of 임시_목록.부분)
		{
			for (const 노래 of 불러오기_노래들(동영상))
			{
				if (!노래.언어)
					continue // id만 가진 항목은 lang이 없으므로 제외
				if (!lang_value || 노래.언어.includes(lang_value)) // (수정) === → includes
				{
					이름들.add(노래.이름)
				}
			}
		}

		선택지_이름.innerHTML = ""
		make_option(선택지_이름, "", "부른 사람", true)
		for (const 이름 of 이름들)
		{
			make_option(선택지_이름, 이름, 이름)
		}
	}

	// lang, name 값에 맞는 title 목록 갱신 (name 선택 시에만 등장)
	function update_title()
	{
		재생_준비_버튼.disabled = true
		const lang_value = 선택지_언어.value
		const name_value = 선택지_이름.value

		선택지_제목.innerHTML = ""
		make_option(선택지_제목, "", "제목", true)

		if (!name_value)
			return // name 기본값이면 목록 비움

		const 제목들 = new Set()

		for (const 동영상 of 임시_목록.부분)
		{
			for (const 노래 of 불러오기_노래들(동영상))
			{
				if (!노래.언어)
					continue // id만 가진 항목은 제외
				const lang_match = !lang_value || 노래.언어.includes(lang_value) // (수정) === → includes
				const name_match = 노래.이름 === name_value
				if (lang_match && name_match)
				{
					제목들.add(노래.제목)
				}
			}
		}


		for (const 제목 of 제목들)
		{
			make_option(선택지_제목, 제목, 제목)
		}
	}

	선택지_언어.addEventListener("change", () =>
	{
		update_name()
		update_title()
	})

	선택지_이름.addEventListener("change", update_title)

	선택지_제목.addEventListener("change", () =>
	{
		재생_준비_버튼.disabled = !선택지_제목.value
	})

	재생_준비_버튼.addEventListener("click", () =>
	{
		const target = "재생_준비_버튼"
		{
			이미지_클릭_강조(target)
			const lang_value = 선택지_언어.value
			const name_value = 선택지_이름.value
			const title_value = 선택지_제목.value

			let song = null
			for (const 노래들 of 임시_목록.부분) // valid_list 대신 임시_목록.long 직접 순회
			{
				const found = 불러오기_노래들(노래들).find(노래 =>
					노래.언어 && // id만 가진 항목은 제외
					(!lang_value || 노래.언어.includes(lang_value)) &&
					노래.이름 === name_value &&
					노래.제목 === title_value
				)
				if (found)
				{
					song = found
					break
				}
			}

			if (song)
			{
				ready_data(song.id, song.시작, song.종료)
			}
		}
	})

	update_name()
}









