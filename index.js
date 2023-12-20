new Vue({
  el: "#app",
  data: function () {
    return {
      originData: [],
      tableData: [],
      isCheckOverTime: false,
      columns: [
        {
          label: "日期",
          id: "date",
        },
        {
          label: "上班时间",
          id: "startTime",
        },
        {
          label: "应下班时间",
          id: "shouldEndTime",
        },
        {
          label: "实际下班时间",
          id: "actualEndTime",
        },
        {
          label: "加班时长",
          id: "timeDifference",
        },
        {
          label: "加班费",
          id: "price",
        },
        {
          label: "周末加班",
          id: "isOffDayWork",
        },
        {
          label: "快捷申请",
          id: "quickApply",
        },
        {
          label: "是否早退",
          id: "isLeaveEarly",
        },
        {
          label: "星期",
          id: "week",
        },
      ],
    };
  },
  methods: {
    handleSelectFile(event) {
      const loading = this.$loading({
        lock: true,
        text: "解析中...",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      beginParse(event.raw)
        .then((res) => {
          this.tableData = res;
          this.originData = res;
          loading.close();
        })
        .catch((e) => {
          loading.close();
          this.$message.error("解析失败了");
        });
    },
    handleCheckOverTime() {
      this.isCheckOverTime = !this.isCheckOverTime;
      this.tableData = this.originData.filter((o) => {
        if (this.isCheckOverTime) {
          return o.timeDifference >= 1 || o.isOffDayWork;
        }
        return true;
      });
    },
    /**
     * 总计
     * @param {*} param
     * @returns
     */
    getSummaries(param) {
      const { columns, data } = param;
      let sums = [];
      let totalPrice = 0;
      let totalHour = 0;
      let isNoSignStartTime = false; //上班有漏卡
      let isNoSignEndTime = false; //下班有漏卡
      let vacationCount = 0; //假期
      data.forEach((item, index) => {
        totalPrice += item.price;
        if (!isNaN(parseInt(item.timeDifference))) {
          if (item.timeDifference >= 1) {
            totalHour += item.timeDifference * 1;
          }
        }
        if (item.actualEndTime === "--") {
          isNoSignEndTime = true;
        }
        if (item.startTime === "--") {
          isNoSignStartTime = true;
        }
        if (item.isOffDayWork) vacationCount += 1;
      });
      sums.length = columns.length;
      sums[0] = "合计";
      if (isNoSignStartTime) sums[1] = "上班有漏卡";
      if (isNoSignEndTime) sums[3] = "下班有漏卡";
      sums[4] = `加班总工时：【${totalHour}】`;
      sums[5] = `加班费：【${totalPrice}】`;
      sums[6] = `可调休：【${vacationCount}】天`;
      return sums;
    },
  },
});
