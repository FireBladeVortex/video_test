
const 상태_칸 = document.getElementById("상태")
const 결과_칸 = document.getElementById("결과")
const 이름_선택 = document.getElementById("이름_선택")

let 불러온_값 = []



// 이름 드롭다운 채우기 (준비.js의 이름_목록 사용, 중복 제거)
;[...new Set(이름_목록.map(누구 => 누구.이름.trim()))].forEach(이름 =>
{
    const 항목 = document.createElement("option")
    항목.value = 이름
    항목.textContent = 이름
    이름_선택.appendChild(항목)
})



// YouTube API 준비
let player = null
let 재생목록_대기 = null

let api_준비_끝 = null
const api_준비 = new Promise(resolve => { api_준비_끝 = resolve })

function onYouTubeIframeAPIReady()
{
    player = new YT.Player("YTP",
    {
        width : "200",
        height : "200",
        events :
        {
            onReady : () => api_준비_끝(),
            onError : () =>
            {
                if (재생목록_대기)
                {
                    재생목록_대기()
                    재생목록_대기 = null
                }
            },
            onStateChange : event =>
            {
                if (event.data === 5 && 재생목록_대기)
                {
                    재생목록_대기()
                    재생목록_대기 = null
                }
            },
        }
    })
}

const api = document.createElement("script")
api.src = "https://www.youtube.com/iframe_api"
document.head.appendChild(api)



// 재생목록 안의 영상 id 목록 얻기
async function 재생목록_조사(id)
{
    const 대기 = new Promise(resolve => { 재생목록_대기 = resolve })
    const 시간초과 = new Promise(resolve => setTimeout(resolve, 5000))

    player.cuePlaylist(
    {
        listType : "playlist",
        list : id
    })

    await Promise.race([대기, 시간초과])
    재생목록_대기 = null

    const 재생목록 = player.getPlaylist() ?? []
    const 결과 = 재생목록.map(id => ({ id }))
    return 결과
}



function 재생목록인가(id)
{
    return id.startsWith("PL")
}



// 주소에서 재생목록 id 또는 영상 id 추출
function id_찾기(주소)
{
    try
    {
        const url = new URL(주소)

        const id_재생목록 = url.searchParams.get("list")
        if (id_재생목록 && 재생목록인가(id_재생목록))
            return id_재생목록

        const v = url.searchParams.get("v")
        const path = url.pathname.split("/").pop()
        const id_동영상 = v ?? path

        const 정규표현식 = /^[a-zA-Z0-9_-]{11}$/
        if (!정규표현식.test(id_동영상))
            return null

        return id_동영상
    }
    catch
    {
        return null
    }
}



// 주소 입력창 → 영상 id 목록
async function 주소_조사(주소)
{
    const 값 = id_찾기(주소)
    if (!값)
        return []

    if (재생목록인가(값))
        return await 재생목록_조사(값)

    return [{ id : 값 }]
}



// data/이름.js 에서 선택한 종류의 영상 id 목록 얻기
function 파일_불러오기(이름)
{
    return new Promise(resolve =>
    {
        delete window.재생목록 // 이전 파일 값과 섞이지 않게 초기화

        const script = document.createElement("script")
        script.src = "data/" + 이름 + ".js"
        script.addEventListener("load", () =>
        {
            const 자료 = window.재생목록
            script.remove()
            resolve(자료)
        })
        script.addEventListener("error", () =>
        {
            script.remove()
            resolve(null)
        })
        document.head.appendChild(script)
    })
}



async function 기존_id_모으기(이름, 종류)
{
    const 자료 = await 파일_불러오기(이름)
    if (!자료 || !Array.isArray(자료[종류]))
        return new Set()

    const 모음 = new Set()

    for (const 동영상 of 자료[종류])
    {
        const 결과 = await 주소_조사(동영상.id ?? "")
        결과.forEach(그것 => 모음.add(그것.id))
    }

    return 모음
}



document.getElementById("불러오기").addEventListener("click", async () =>
{
    const 주소 = document.getElementById("주소_입력").value.trim()
    if (!주소)
    {
        상태_칸.textContent = "주소를 입력하세요"
        return
    }

    상태_칸.textContent = "불러오는 중"
    await api_준비
    불러온_값 = await 주소_조사(주소)
    상태_칸.textContent = "불러온 영상 " + 불러온_값.length + "개"
})



document.getElementById("비교하기").addEventListener("click", async () =>
{
    if (불러온_값.length === 0)
    {
        상태_칸.textContent = "먼저 불러오기를 실행하세요"
        return
    }

    상태_칸.textContent = "비교하는 중"
    await api_준비

    const 기존 = await 기존_id_모으기(이름_선택.value, document.getElementById("종류_선택").value)
    const 새것 = 불러온_값.filter(동영상 => !기존.has(동영상.id))

    결과_칸.textContent = 새것
        .map(동영상 => '{\n\tid : "https://youtu.be/' + 동영상.id + '",\n},')
        .join("\n")

    상태_칸.textContent = "기존 " + 기존.size + "개 / 새로운 영상 " + 새것.length + "개"
})



document.getElementById("복사하기").addEventListener("click", async () =>
{
    await navigator.clipboard.writeText(결과_칸.textContent)
    상태_칸.textContent = "복사됨"
})