const REOPORT_DATE = "2023-11-01";
const OFF_DAY = ["星期六", "星期日"];

/**
 * 解析excel
 * @returns json
 */
function beginParse(file) {
  return new Promise(async (resolve, reject) => {
    const buffer = await fileToArrayBuffer(file);
    // 读取 Excel 文件
    const workbook = XLSX.read(buffer, { type: "array" });

    // 获取第一个 sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // 将表格数据转换为 JSON 对象
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // 处理每一行数据
    const result = jsonData
      .map((entry) => {
        // 获取上班时间和下班时间
        const startTime = entry["__EMPTY_44"];
        const actualEndTime = entry["__EMPTY_50"];
        const date = entry["概况统计与打卡明细"];
        if (startTime === "--") {
          const [formatDate, week] = date.split(" ").map((o) => o.trim());
          const type = OFF_DAY.includes(week) ? "休息日" : "请假";
          return {
            startTime: type,
            shouldEndTime: type,
            actualEndTime: type,
            timeDifference: type,
            isLeaveEarly: false,
            date: formatDate,
            price: 0,
            week,
          };
        }

        // excel脏数据
        if (!startTime || !startTime.includes(":")) return {};

        const [formatDate, week] = date.split(" ").map((o) => o.trim());

        // 根据上班时间推算应下班时间
        const shouldEndTime = calculateShouldEndTime(startTime);

        // 计算实际下班时间和应下班时间的差异（单位：小时）
        const timeDifference = calculateTimeDifference(
          shouldEndTime,
          actualEndTime
        );
        let price = 0;
        if (timeDifference > 1) {
          price = Math.floor(timeDifference) * 30;
          price += timeDifference.split(".")[1] >= 5 ? 15 : 0; //半小时加班费
          price +=
            timeDifference.split(".")[0] >= 3
              ? 50
              : ["2"].includes(timeDifference.split(".")[0])
              ? 20
              : 0; //3小时餐补和2小时餐补
        }
        console.log("---", typeof timeDifference.split(".")[0]);

        return {
          startTime,
          shouldEndTime,
          actualEndTime,
          timeDifference,
          isLeaveEarly:
            +new Date(`${REOPORT_DATE} ${actualEndTime}`) <
            +new Date(`${REOPORT_DATE} ${shouldEndTime}`),
          date: formatDate,
          price,
          week,
        };
      })
      .filter((o) => o.startTime);

    resolve(result);
  });
}

// 示例函数：根据上班时间推算应下班时间
function calculateShouldEndTime(startTime) {
  const baseEndTime = new Date(`${REOPORT_DATE} 18:30`);

  // 解析上班时间
  const [hours, minutes] = startTime.split(":").map(Number);
  if (hours === 8) {
    return dayjs(baseEndTime).format("HH:mm");
  }
  if (hours === 9) {
    return dayjs(baseEndTime).add(minutes, "minute").format("HH:mm");
  }
  if (hours === 10) {
    return dayjs(baseEndTime).add(1, "hour").format("HH:mm");
  }
}

//计算两个时间之间的差异，返回小时
function calculateTimeDifference(shouldTime, actualTime) {
  const shouldDateTime = new Date(`${REOPORT_DATE} ${shouldTime}`);
  const actualDateTime = new Date(`${REOPORT_DATE} ${actualTime}`);

  const timeDifference = (actualDateTime - shouldDateTime) / (1000 * 60 * 60);
  return timeDifference.toFixed(1);
}

/**
 * File转arrayBuffer
 * @param {*} file
 * @returns
 */
function fileToArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.addEventListener(
      "loadend",
      (e) => {
        resolve(e.target.result);
      },
      false
    );

    fileReader.readAsArrayBuffer(file);
  });
}
