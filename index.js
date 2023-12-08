new Vue({
  el: "#app",
  data: function () {
    return {
      tableData: [],
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
      const res = beginParse(event.raw)
        .then((res) => {
          this.tableData = res;
          loading.close();
        })
        .catch((e) => {
          loading.close();
          this.$message.error("解析失败了");
        });
    },
    getSummaries(param) {
      const { columns, data } = param;
      let sums = [];
      let totalPrice = 0;
      let totalHour = 0;
      data.forEach((item, index) => {
        totalPrice += item.price;
        if (!isNaN(parseInt(item.timeDifference)))
          if (item.timeDifference >= 1) {
            totalHour += item.timeDifference * 1;
          }
      });
      sums.length = columns.length;
      sums[0] = "合计";
      sums[5] = `加班总工时：【${totalHour}】`;
      sums[6] = `加班费：【${totalPrice}】`;
      return sums;
    },
  },
});
