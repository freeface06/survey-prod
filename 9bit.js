let now_div = "div_1";
let div_count = 1; // div의 개수

let item_count = 0; // item의 개수

$(document).on("click", ".delete-btn", function () {
    // confirm 창 띄우기
    if (!confirm("정말 삭제하시겠습니까?")) {
        return;
    }

    // .item 내부에 있는 삭제 버튼인 경우
    if ($(this).closest(".item").length > 0) {
        $(this).closest(".item").remove();
    } else {
        // 그렇지 않은 경우, 즉 .item 내부가 아닌 삭제 버튼이면 가장 가까운 .div 요소 삭제
        $(this).closest(".div").remove();
    }

    generateSummaryList();
    scroll_trigger();
});

$(document).ready(function () {
    // "이미지 추가" 버튼 클릭 시 해당 .img-box 내의 파일 선택 input을 클릭
    $(document).on('click', '.add-img-btn', function () {
        $(this).next('.img-box').find('.imgUploader').click();
    });

    // 파일 선택 input 변경 이벤트 (여러 장 선택 가능)
    $(document).on('change', '.imgUploader', function (e) {
        var files = e.target.files;
        // 해당 input의 부모 .img-box 내의 .img-list 영역
        var $imgBox = $(this).closest('.img-box');
        var container = $imgBox.find('.img-list');
        var maxFiles = 10;
        // 현재 업로드된 이미지 수
        var existingCount = container.find('.preview-item').length;
        var availableSlots = maxFiles - existingCount;

        if (availableSlots <= 0) {
            alert('최대 ' + maxFiles + '개까지 업로드 가능합니다.');
            $(this).val(''); // 파일 input 초기화
            return;
        }

        if (files.length > availableSlots) {
            alert('현재 ' + existingCount + '개의 이미지가 있습니다. 최대 ' + maxFiles + '개까지 업로드 가능합니다. 나머지 파일은 추가되지 않습니다.');
        }

        var filesToProcess = Math.min(files.length, availableSlots);

        // 파일 선택 시 이미지를 추가하기 전에 .img-box를 보여줍니다.
        $imgBox.show();

        for (var i = 0; i < filesToProcess; i++) {
            var file = files[i];
            if (file.type.match('image.*')) {
                var reader = new FileReader();
                reader.onload = (function (file) {
                    return function (e) {
                        var previewHTML = '<div class="preview-item">' +
                            '<img src="' + e.target.result + '" alt="preview">' +
                            '<button class="remove-preview-btn"><span class="material-symbols-outlined">close</span></button>' +
                            '</div>';
                        container.append(previewHTML);
                    };
                })(file);
                reader.readAsDataURL(file);
            } else {
                alert('이미지 파일만 선택 가능합니다.');
            }
        }
        // 선택된 이미지가 하나라도 있으면 해당 .img-box 내의 "확인" 버튼을 표시
        $imgBox.find('.confirm-img-btn').show();

    });

    // 개별 미리보기 이미지 삭제 버튼 클릭 이벤트
    $(document).on('click', '.remove-preview-btn', function () {
        var $imgBox = $(this).closest('.img-box');
        $(this).closest('.preview-item').remove();
        // 만약 남은 미리보기 이미지가 0개라면 .img-box를 숨깁니다.
        if ($imgBox.find('.preview-item').length === 0) {
            $imgBox.hide();
        }
    });

    // "확인" 버튼 클릭 시: 해당 .img-box 내에서 파일 선택 input 초기화하고 버튼 숨김
    $(document).on('click', '.confirm-img-btn', function () {
        $(this).hide();
        $(this).closest('.img-box').find('.imgUploader').val('');
    });

    generateSummaryList();

    $(document).on("input", "input, textarea", function () {
        generateSummaryList();
        scroll_trigger();
    });

    $(document).on("click", ".div-header", function (e) {
        if (e.target.tagName == "SPAN") {
            return;
        }
        if ($(e.target).is("input, textarea, label, select")) {
            return;
        }

        const icon = $(this).find(".toggle-btn span"); // 버튼 안의 아이콘

        const container = $(this).closest(".div").find(".item-container"); // 대상 컨테이너

        container.toggleClass("hidden"); // 숨김 클래스 토글

        // 아이콘 전환
        if (container.hasClass("hidden")) {
            icon.text("keyboard_arrow_down");
        } else {
            icon.text("keyboard_arrow_up");
        }
    });

    $(document).on("click", ".toggle-btn", function (e) {
        const icon = $(this).find("span"); // 버튼 안의 아이콘

        const container = $(this).closest(".div").find(".item-container"); // 대상 컨테이너

        container.toggleClass("hidden"); // 숨김 클래스 토글

        // 아이콘 전환
        if (container.hasClass("hidden")) {
            icon.text("keyboard_arrow_down");
        } else {
            icon.text("keyboard_arrow_up");
        }
    });

    $(document).on("click", ".open-btn", function () {
        $(".div .item-container:visible").removeClass("hidden");
        $(".toggle-btn span:visible").text("keyboard_arrow_up");
    });

    $(document).on("click", ".close-btn", function () {
        $(".div .item-container:visible").addClass("hidden");
        $(".toggle-btn span:visible").text("keyboard_arrow_down");
    });

    scroll_trigger();

});

function applySortableTo(container) {
    new Sortable(container, {
        handle: '.inner-handle',
        animation: 150,
        draggable: '.item',
        scroll: true,
        scrollSensitivity: 30,
        scrollSpeed: 10,
        onEnd: function (evt) {
            generateSummaryList();
        }
    });
}

// 페이지 로딩 시 1번만 실행
document.addEventListener('DOMContentLoaded', function () {
    // .div 정렬용 (checklist-body 안)
    new Sortable(document.querySelector('.checklist-body'), {
        handle: '.outer-handle',
        animation: 150,
        draggable: '.div',
        scroll: true,
        scrollSensitivity: 30,
        scrollSpeed: 10,
        onEnd: function (evt) {
            generateSummaryList();
        }
    });

    // 초기 .item-container에만 적용
    document.querySelectorAll('.item-container').forEach(function (container) {
        applySortableTo(container);
    });
});


// 동적으로 item-container 하나 추가할 때는 이렇게!
function addItemTo(now_div, newItem) {
    const container = $("#" + now_div).find(".item-container");
    container.append(newItem);
    applySortableTo(container[0]); // 새로 추가된 곳에만 정렬 적용
}

// div 클릭 시 활성화 상태 변경
$(document).on("click", ".div", function () {
    // 현재 클릭한 요소의 id 값을 가져옵니다.
    var divId = $(this).attr("id");
    active_div(divId);
});

function active_div(divId) {
    if (divId == undefined) {
        return;
    }

    now_div = divId; // 현재 클릭한 div의 id 값을 저장합니다.

    $(".div").removeClass("active"); // 모든 div에서 active 클래스를 제거합니다.
    $(`#${divId}`).addClass("active"); // 현재 클릭한 div에 active 클래스를 추가합니다.
}

// 체크박스 추가 버튼 클릭 시 새로운 체크박스 항목 추가
$(document).on("click", ".append-checkbox-btn", function () {
    // 추가할 HTML 코드 (새로운 checkbox-item)
    var newCheckboxItem = '<div class="checkbox-item">' +
        '<input type="checkbox" disabled>' +
        '<input type="text" placeholder="항목 제목을 입력하세요" class="checkbox-title"><span class="material-symbols-outlined delete">close</span >' +
        '</div>';
    // 현재 버튼의 부모 요소에 새 항목을 append 합니다.
    $(this).parent().append(newCheckboxItem);
});

// 라디오박스스 추가 버튼 클릭 시 새로운 체크박스 항목 추가
$(document).on("click", ".append-radiobox-btn", function () {
    // 추가할 HTML 코드 (새로운 radiobox-item)
    var newCheckboxItem = '<div class="radiobox-item">' +
        '<input type="radio" disabled>' +
        '<input type="text" placeholder="항목 제목을 입력하세요" class="radiobox-title"><span class="material-symbols-outlined delete">close</span >' +
        '</div>';
    // 현재 버튼의 부모 요소에 새 항목을 append 합니다.
    $(this).parent().append(newCheckboxItem);
});

$(document).on("click", ".checkbox-item .delete", function () {
    $(this).closest(".checkbox-item").remove();
});

$(document).on("click", ".radiobox-item .delete", function () {
    $(this).closest(".radiobox-item").remove();
});

function add_component(type) {
    if (type == "div") {
        div_count++; // div의 개수를 증가시킵니다

        // 새로운 div 생성
        var newDiv = $("#add_div_content").clone();
        newDiv.attr("id", "div_" + div_count);
        newDiv.css("display", "block");

        // div 추가
        $(".checklist-body").append(newDiv);

        // .item-container 가져오기
        let newContainer = newDiv.find(".item-container");

        if (newContainer.length > 0) {
            applySortableTo(newContainer[0]); // DOM element 넘겨주기
        }

        move_tag("div_" + div_count);
    } else if (type == "short_text") {
        item_count++;
        var newDiv = $("#add_short_text_content").clone();

        newDiv.attr("id", "item_" + item_count);
        newDiv.css({
            "display": "block",
        });
        $("#" + now_div + " .item-container").append(newDiv);
        move_tag("item_" + item_count);
    } else if (type == "long_text") {
        item_count++;
        var newDiv = $("#add_long_text_content").clone();

        newDiv.attr("id", "item_" + item_count);
        newDiv.css({
            "display": "block",
        });
        $("#" + now_div + " .item-container").append(newDiv);
        move_tag("item_" + item_count);
    } else if (type == "check") {
        item_count++;
        var newDiv = $("#add_checkbox_content").clone();

        newDiv.attr("id", "item_" + item_count);
        newDiv.css({
            "display": "block",
        });
        $("#" + now_div + " .item-container").append(newDiv);
        move_tag("item_" + item_count);
    } else if (type == "radio") {
        item_count++;
        var newDiv = $("#add_radiobox_content").clone();

        newDiv.attr("id", "item_" + item_count);
        newDiv.css({
            "display": "block",
        });
        $("#" + now_div + " .item-container").append(newDiv);
        move_tag("item_" + item_count);
    }

    generateSummaryList();

}

function generateSummaryList() {
    let list = $("<ul></ul>");

    // 1뎁스: 스케줄 제목 (배지 + 값)
    let title = $("input[name='title']").val();
    let titleLi = $("<li class='right-bar-title' onclick=\"move_tag('title')\"><b>" + (title == "" ? "제목" : title) + "</b></li>");

    list.append(titleLi);

    // 구분 반복
    $(".div:visible").each(function (index, divElem) {
        let divId = $(divElem).attr("id");
        let divTitle = $(divElem).find("input[name='div_title']").val();
        let divLi = $(`<li class="li-item ${divId}"><span onclick=\"move_tag('${divId}')\" class='badge badge-1depth'>` + (index + 1) + "</span> " + `<span onclick=\"move_tag('${divId}')\">` + (divTitle == "" ? (index + 1) + "구분" : divTitle) + "</span></li>");

        // 2뎁스: 질문 제목(값만)
        let itemUl = $("<ul></ul>");
        $(divElem).find(".item").each(function (itemIndex, itemElem) {
            let itemId = $(itemElem).attr("id");
            let itemTitle = $(itemElem).find("input[name='item_title']").val();
            itemUl.append(`<li class="li-item ${itemId}"><span onclick=\"move_tag('${itemId}')\" class='badge badge-2depth'>` + (index + 1) + "." + (itemIndex + 1) + "</span> " + `<span onclick=\"move_tag('${itemId}')\">` + (itemTitle == "" ? (index + 1) + "." + (itemIndex + 1) + "질문" : itemTitle) + "</span></li>");
        });

        divLi.append(itemUl); // 구분에 질문 목록 붙이기
        list.append(divLi);   // 전체 목록에 구분 추가
    });

    $("#right_sidebar").html(list);
}

function scroll_trigger() {
    const content = document.querySelector('.main-content');
    content.dispatchEvent(new Event('scroll'));
}

// 오른쪽 메뉴바에서 항목 클릭 시 해당 항목으로 스크롤 이동
function move_tag(id) {
    if (id) {
        const $container = $(".main-content");
        const $target = $("#" + id);

        if (id.split("_")[0] == "div") {
            active_div(id);
        } else {
            const parentId = $target.closest(".div").attr("id");
            $(`#${parentId} .item-container`).removeClass("hidden");

            $(`#${parentId} .div-header .toggle-btn span`).text("keyboard_arrow_up");

            active_div(parentId);
        }

        if ($container.length > 0 && $target.length > 0) {
            const offset = $target.offset().top - $container.offset().top + $container.scrollTop() - 250;

            $container.animate({
                scrollTop: offset
            }, 500);
        }
    }
}

function move_menu(className) {
    const element = document.querySelector('.' + className);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        alert("해당 class명을 가진 요소를 찾을 수 없습니다: " + className);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const mainContent = document.querySelector(".main-content");
    const scrollToTopBtn = document.getElementById("scrollToTopBtn");

    if (mainContent) {
        mainContent.addEventListener("scroll", function () {
            // 📌 1. 현재 화면 중앙에 가까운 div/item 찾기
            const { divId, itemId } = getClosestDivAndItemToCenter();

            $(".li-item").removeClass("li-active");
            $(`.${divId}`).addClass("li-active");
            $(`.${itemId}`).addClass("li-active");

            move_menu(divId);

            // 📌 2. 스크롤 퍼센트 계산
            const scrollTop = mainContent.scrollTop;
            const scrollHeight = mainContent.scrollHeight - mainContent.clientHeight;
            const scrollPercent = scrollTop / scrollHeight;

            // 📌 3. 스크롤 위치에 따라 버튼 표시
            if (scrollPercent > 0.5) {
                $("#scrollToTopBtn").addClass("show");
            } else {
                $("#scrollToTopBtn").removeClass("show");
            }
        });

        // 📌 4. 맨 위로 버튼 클릭 시 스크롤 애니메이션
        scrollToTopBtn?.addEventListener("click", () => {
            mainContent.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    } else {
        console.warn(".main-content 요소가 존재하지 않습니다.");
    }
});


function getClosestDivAndItemToCenter() {
    const mainContent = document.querySelector(".main-content");
    const divs = mainContent.querySelectorAll(".div");
    const contentRect = mainContent.getBoundingClientRect();
    const centerY = contentRect.top + contentRect.height / 2;

    let closestDiv = null;
    let closestDivDistance = Infinity;
    let closestItem = null;

    divs.forEach(div => {
        const divRect = div.getBoundingClientRect();
        const divCenterY = divRect.top + divRect.height / 2;
        const distance = Math.abs(divCenterY - centerY);

        if (distance < closestDivDistance) {
            closestDivDistance = distance;
            closestDiv = div;
        }
    });

    if (closestDiv) {
        const items = closestDiv.querySelectorAll(".item");

        let closestItemDistance = Infinity;

        items.forEach(item => {
            const itemRect = item.getBoundingClientRect();
            const itemCenterY = itemRect.top + itemRect.height / 2;
            const distance = Math.abs(itemCenterY - centerY);

            if (distance < closestItemDistance) {
                closestItemDistance = distance;
                closestItem = item;
            }
        });
    }

    return {
        divId: closestDiv ? closestDiv.id : null,
        itemId: closestItem ? closestItem.id : null
    };
}

async function save() {
    const result = {
        title: document.querySelector('#title')?.value || '',
        sub_title: document.querySelector('#sub_title')?.value || '',
        footer: document.querySelector('textarea[name="footer"]')?.value || '',
        divs: []
    };

    const divElements = document.querySelectorAll('.checklist-body .div');

    for (const div of divElements) {
        const divTitle = div.querySelector('input[name="div_title"]')?.value || '';
        const divSubTitle = div.querySelector('input[name="div_sub_title"]')?.value || '';
        const divId = div.id;

        const items = [];
        const itemElements = div.querySelectorAll('.item');

        for (const item of itemElements) {
            const itemId = item.id;
            const isRequired = item.querySelector('input.is-required')?.checked || false;
            const questionTitle = item.querySelector('input[name="item_title"]')?.value || '';
            const itemType = item.getAttribute('type') || 'text';

            const itemData = {
                item_id: itemId,
                required: isRequired,
                question_title: questionTitle,
                type: itemType
            };

            // 옵션 항목 수집
            if (itemType === 'radio' || itemType === 'checkbox') {
                const optionClass = itemType === 'radio' ? 'radiobox-item' : 'checkbox-item';
                const options = [];

                item.querySelectorAll(`.${optionClass}`).forEach(opt => {
                    const title = opt.querySelector('input[type="text"]')?.value || '';
                    if (title.trim()) {
                        options.push(title.trim());
                    }
                });

                itemData.options = options;
            }

            // 이미지 업로드 수집
            const imgInput = item.querySelector('input.imgUploader');
            if (imgInput && imgInput.files.length > 0) {
                itemData.images = await readFilesAsBase64(imgInput.files);
            }

            items.push(itemData);
        }

        result.divs.push({
            div_id: divId,
            div_title: divTitle,
            div_sub_title: divSubTitle,
            items: items
        });
    }

    console.log(result);
    alert(JSON.stringify(result, null, 2)); // 결과를 JSON 형태로 출력
}

// Helper: 파일들을 base64로 변환
function readFilesAsBase64(fileList) {
    const promises = Array.from(fileList).map(file => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result); // base64 결과
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });
    });

    return Promise.all(promises);
}

