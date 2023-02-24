class ReturnsCashFlowChart {
  constructor(el) {
    this.el = el;
    this._resize = this._resize.bind(this);
    this._entered = this._entered.bind(this);
    this._moved = this._moved.bind(this);
    this._left = this._left.bind(this);
    this._init();
  }

  _init() {
    this._setup();
    this._scaffold();
    this.ro = new ResizeObserver(this._resize);
    this.ro.observe(this.el);
    this.io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          this.isInView = true;
          setTimeout(() => {
            this._render();
          }, 500);
        }
      });
    });
    this.io.observe(this.el);
  }

  _setup() {
    this.breakpoint = 430;

    this.totalCircleRadius = 7;
    this.totalCircleStrokeWidth = 6;
    this.totalHandleRadius = 14;
    this.totalHandleStrokeWidth = 3;
    this.totalHandleSpanAngle = Math.PI / 3.5;

    this.marginTop = this.totalCircleRadius + this.totalCircleStrokeWidth / 2;
    this.marginRight = this.totalHandleRadius + this.totalHandleStrokeWidth / 2;
    this.marginBottom = 32;
    this.marginLeft = this.totalHandleRadius + this.totalHandleStrokeWidth / 2;
    this.height = 275;

    this.lgBarPadding = 10;
    this.smBarWidth = 5;
    this.lgBarBorderRadius = 4;
    this.smBarBorderRadius = this.smBarWidth / 2;
    this.xTickPadding = 20;
    this.barLabelsPadding = 12;
    this.barLabelsRowOffset = 16;
    this.barLabelsHeightWithPadding = 28;

    this.tooltipOffset = 16;

    this.iActiveDefault = this.iActive = 9;

    this.x = d3.scalePoint();
    this.y = d3.scaleLinear();

    this.formatValue = d3.format("$,");

    this.accessorsByChartType = new Map([
      [
        "returns",
        [
          {
            name: "Cum. Cash Flow",
            value: (d) => d.cumulativeTotalCashflow,
            barValue: (d) => d.accruedEquity + d.cumulativeTotalCashflow,
          },
          {
            name: "Equity",
            value: (d) => d.accruedEquity,
            barValue: (d) => d.accruedEquity,
          },
          {
            name: "Total Returns",
            value: (d) => d.totalReturns,
            isTotal: true,
          },
        ],
      ],
      [
        "cashFlow",
        [
          {
            name: "Rental Cash Flow",
            value: (d) => d.rentalCashflow,
            barValue: (d) => d.rentalCashflow + d.otherIncome,
          },
          {
            name: "Other Income",
            value: (d) => d.otherIncome,
            barValue: (d) => d.otherIncome,
          },
          {
            name: "Monthly Cash Flow",
            value: (d) => d.totalCashflow,
            isTotal: true,
          },
        ],
      ],
      [
        "cashInDeal",
        [
          {
            name: "closing",
            value: (d) => d.cashToClose,
          },
          {
            name: "stabilizing",
            value: (d) => d.cashToStabilize,
          },
          {
            name: "refinance",
            value: (d) => d.cashInDealAfterRefinance,
          },
        ],
      ],
    ]);
  }

  _scaffold() {
    d3.select(this.el).selectAll("*").remove();

    this.container = d3
      .select(this.el)
      .append("div")
      .attr("class", "returns-cash-flow-chart");

    this.svg = this.container
      .append("svg")
      .on("pointerenter", this._entered)
      .on("pointermove", this._moved)
      .on("pointerleave", this._left);

    this.svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "returnsCashFlowChartGradient")
      .attr("gradientTransform", "rotate(90)")
      .selectAll("stop")
      .data([
        { offset: "15%", stopColor: "#5261F0" },
        { offset: "100%", stopColor: "#7949FF" },
      ])
      .join("stop")
      .attr("offset", (d) => d.offset)
      .attr("stop-color", (d) => d.stopColor);

    this.xAxisG = this.svg
      .append("g")
      .attr("class", "axis-g axis-g--x")
      .attr("transform", `translate(0,${this.height - this.marginBottom})`);

    this.barsG = this.svg.append("g").attr("class", "bars-g");
    this.cashInDealBarsG = this.svg
      .append("g")
      .attr("class", "cash-in-deal-bars-g");

    this.zeroLine = this.svg
      .append("line")
      .attr("class", "zero-line")
      .attr("stroke", "currentColor");

    this.totalG = this.svg.append("g").attr("class", "total-g");
    this._renderTotal();

    this.tooltip = this.container.append("div").attr("class", "tooltip");

    this.tooltipArrowSize = 5; // Make sure it matches --arrow-size in css

    this.tooltipArrow = this.tooltip
      .append("div")
      .attr("class", "tooltip__arrow");
    this.tooltipBody = this.tooltip
      .append("div")
      .attr("class", "tooltip__body");
  }

  _resize() {
    this.width = this.container.node().clientWidth;

    this.svg.attr("viewBox", [0, 0, this.width, this.height]);

    this._render();
  }

  _wrangle() {
    this.isCashInDeal = this.chartType === "cashInDeal";
    this.isInteractive = !this.isCashInDeal;
    this.showXAxis = !this.isCashInDeal;
    this.showZeroLine = this.isCashInDeal;

    this.accessors = this.accessorsByChartType.get(this.chartType);

    if (this.isCashInDeal) {
      this.displayData = this.accessors.map((a) => {
        const value = a.value(this.data);
        const name = value === null ? `no ${a.name}` : a.name;
        const labels = [
          {
            text: name,
            type: "name",
          },
          {
            text: value === null ? "" : this.formatValue(value),
            type: "value",
          },
        ];
        if (value < 0) labels.reverse();
        const colorClass = value < 0 ? "series-1" : "series-2";
        return {
          name,
          value,
          barValue: value,
          labels,
          colorClass,
        };
      });

      this.x.domain(this.displayData.map((d) => d.name));

      const barValues = this.displayData.map((d) => d.barValue);
      const [minBarValue, maxBarValue] = d3.extent(barValues);
      const containsNull = barValues.some((d) => d === null);
      this.barMinHeight = this.lgBarBorderRadius * 2;
      const marginBottom = this.marginTop; // Less margin bottom because no x axis is rendered
      if (minBarValue >= 0) {
        this.zeroLineY = this.height - marginBottom;
        this.y
          .domain([0, maxBarValue])
          .range([
            this.height - marginBottom - this.barMinHeight,
            this.marginTop + this.barLabelsHeightWithPadding,
          ]);
      } else if (maxBarValue < 0) {
        this.zeroLineY =
          this.marginTop + (containsNull ? this.barLabelsHeightWithPadding : 0);
        this.y
          .domain([minBarValue, 0])
          .range([
            this.height - marginBottom - this.barLabelsHeightWithPadding,
            this.marginTop +
              (containsNull ? this.barLabelsHeightWithPadding : 0) +
              this.barMinHeight,
          ]);
      } else {
        this.zeroLineY =
          this.marginTop +
          this.barLabelsHeightWithPadding +
          (this.height -
            this.marginTop -
            marginBottom -
            this.barLabelsHeightWithPadding * 2 -
            this.barMinHeight * 2) *
            (maxBarValue / (maxBarValue - minBarValue)) +
          this.barMinHeight;
        this.y
          .domain([minBarValue, 1e-6, 0, maxBarValue])
          .range([
            this.height - marginBottom - this.barLabelsHeightWithPadding,
            this.zeroLineY + this.barMinHeight,
            this.zeroLineY - this.barMinHeight,
            this.marginTop + this.barLabelsHeightWithPadding,
          ]);
      }
    } else {
      this.displayData = this.data.map((d) => {
        const valueAccessors = this.accessors.filter((d) => !d.isTotal);
        const totalAccessor = this.accessors.find((d) => d.isTotal);
        return {
          year: d.year,
          values: valueAccessors.map((a) => ({
            name: a.name,
            value: a.value(d),
            barValue: a.barValue(d),
          })),
          total: {
            name: totalAccessor.name,
            value: totalAccessor.value(d),
          },
        };
      });

      this.years = this.displayData.map((d) => d.year);

      this.x.domain(this.years);

      this.y.domain([
        0,
        d3.max(this.displayData, (d) => d3.max(d.values, (d) => d.barValue)),
      ]);

      this.zeroLineY = this.height - this.marginBottom;
    }

    this._render();
  }

  _setBreakpointEffects() {
    this.xTickValues = this.years;

    this.isLarge = this.width > this.breakpoint;
    this.showTotal = !this.isLarge && !this.isCashInDeal;
    if (this.showTotal && this.iActive === null)
      this.iActive = this.iActiveDefault;

    const n = this.x.domain().length;

    if (this.isLarge || this.isCashInDeal) {
      this.barBorderRadius = this.lgBarBorderRadius;
      this.barPadding = this.lgBarPadding;
      this.barWidth =
        (this.width -
          this.marginLeft -
          this.marginRight -
          (n - 1) * this.barPadding) /
        n;
    } else {
      this.barBorderRadius = this.smBarBorderRadius;
      this.barWidth = this.smBarWidth;
      this.barPadding =
        (this.width - this.marginLeft - this.marginRight - n * this.barWidth) /
        (n - 1);

      if (n >= 20) {
        this.xTickValues = this.xTickValues.filter(
          (d) => d === 1 || d % 5 === 0
        );
      }
    }

    this.barMinHeight = this.barBorderRadius * 2;
    this.x.range([
      this.marginLeft + this.barWidth / 2,
      this.width - this.marginRight - this.barWidth / 2,
    ]);

    if (!this.isCashInDeal) {
      this.y.range([
        this.height - this.marginBottom - this.barMinHeight,
        this.marginTop,
      ]);
    }
  }

  _render() {
    if (!this.isInView || !this.width || !this.displayData) return;
    this._setBreakpointEffects();
    this.container
      .classed("is-transitioning", true)
      .classed("is-interactive", this.isInteractive)
      .classed("show-total", this.showTotal)
      .classed("show-x-axis", this.showXAxis)
      .classed("show-zero-line", this.showZeroLine)
      .classed("is-cash-in-deal", this.isCashInDeal);
    if (this.isInteractive) this.xs = this.years.map((d) => this.x(d));
    this.transition = this.svg.transition().duration(300).delay(100);
    if (this.showXAxis) this._renderXAxis();
    if (this.isCashInDeal) {
      this._renderCashInDealBars();
    } else {
      this._renderBars();
    }
    if (this.showZeroLine) this._renderZeroLine();
    this.transition.on("end", () => {
      if (this.showTotal) this._updateActive();
      this.container.classed("is-transitioning", false);
    });
  }

  _renderTotal() {
    this.totalRect = this.totalG
      .append("rect")
      .attr("class", "total-rect")
      .attr("fill", "currentColor")
      .attr("rx", this.smBarBorderRadius)
      .attr("x", -this.smBarWidth / 2)
      .attr("width", this.smBarWidth);
    this.totalMarkerG = this.totalG
      .append("g")
      .attr("class", "total-marker-g")
      .call((g) =>
        g
          .append("circle")
          .attr("class", "total-circle")
          .attr("fill", "none")
          .attr("stroke", "currentColor")
          .attr("stroke-width", this.totalCircleStrokeWidth)
          .attr("r", this.totalCircleRadius)
      )
      .call((g) =>
        g
          .selectAll("path")
          .data([
            {
              startAngle:
                Math.PI / 2 - this.totalHandleSpanAngle / 2 - Math.PI / 2,
              endAngle:
                Math.PI / 2 + this.totalHandleSpanAngle / 2 - Math.PI / 2,
            },
            {
              startAngle:
                (Math.PI / 2) * 3 - this.totalHandleSpanAngle / 2 - Math.PI / 2,
              endAngle:
                (Math.PI / 2) * 3 + this.totalHandleSpanAngle / 2 - Math.PI / 2,
            },
          ])
          .join("path")
          .attr("class", "total-handle-path")
          .attr("stroke-linecap", "round")
          .attr("fill", "none")
          .attr("stroke", "currentColor")
          .attr("stroke-width", this.totalHandleStrokeWidth)
          .attr("d", (d) => {
            const p = d3.path();
            p.arc(0, 0, this.totalHandleRadius, d.startAngle, d.endAngle);
            return p.toString();
          })
      );
  }

  _updateTotal() {
    const d = this.displayData.find((_, i) => this.iActive === i);
    const x = this.x(d.year);
    const y = this.y(d.total.value);
    this.totalG.attr("transform", `translate(${x},0)`);
    this.totalRect.attr("y", y).attr("height", Math.max(this.zeroLineY - y, 0));
    this.totalMarkerG.attr("transform", `translate(0,${y})`);
  }

  _renderXAxis() {
    this.xAxisG
      .transition(this.transition)
      .call(
        d3
          .axisBottom(this.x)
          .tickSize(0)
          .tickPadding(this.xTickPadding)
          .tickValues(this.xTickValues)
      );
  }

  _renderCashInDealBars() {
    const barG = this.cashInDealBarsG
      .selectAll(".bar-g")
      .data(this.displayData, (d) => d.name)
      .join((enter) =>
        enter
          .append("g")
          .attr("class", "bar-g")
          .attr("transform", (d) => `translate(${this.x(d.name)},0)`)
          .call((g) =>
            g
              .append("rect")
              .attr("class", "bar-rect")
              .attr("fill", "currentColor")
              .attr("rx", this.barBorderRadius)
              .attr("x", -this.barWidth / 2)
              .attr("width", this.barWidth)
          )
      );

    barG
      .select(".bar-rect")
      .attr("y", this.zeroLineY)
      .attr("height", 0)
      .attr("class", (d) => `bar-rect ${d.colorClass}`);

    barG
      .selectAll(".bar-text")
      .data((d) => d.labels)
      .join((enter) =>
        enter
          .append("text")
          .attr("class", "bar-text")
          .attr("fill", "currentColor")
          .attr("dy", "0.32em")
          .attr("text-anchor", "middle")
      )
      .attr("y", this.zeroLineY)
      .attr("y", (d, i, n) => {
        const p = d3.select(n[i].parentNode).datum();
        if (p.barValue === null) return this.zeroLineY;
        const sign = this.y(p.barValue) > this.zeroLineY ? 1 : -1;
        return (
          this.zeroLineY +
          sign * (this.barLabelsPadding + i * this.barLabelsRowOffset)
        );
      })
      .attr("class", (d) => `bar-text bar-text--${d.type}`)
      .text((d) => d.text);

    barG
      .transition(this.transition)
      .attr("transform", (d) => `translate(${this.x(d.name)},0)`)
      .call((t) =>
        t
          .select(".bar-rect")
          .attr("x", -this.barWidth / 2)
          .attr("y", (d) =>
            d.barValue === null
              ? this.zeroLineY
              : d.barValue >= 0
              ? this.y(d.barValue)
              : this.zeroLineY
          )
          .attr("width", this.barWidth)
          .attr("height", (d) =>
            d.barValue === null
              ? 0
              : Math.abs(this.zeroLineY - this.y(d.barValue))
          )
      )
      .call((t) =>
        t.selectAll(".bar-text").attr("y", (d, i, n) => {
          const p = d3.select(n[i].parentNode).datum();
          let y = p.barValue === null ? this.zeroLineY : this.y(p.barValue);
          const sign = y > this.zeroLineY ? 1 : -1;
          y += sign * (this.barLabelsPadding + i * this.barLabelsRowOffset);
          return y;
        })
      );
  }

  _renderBars() {
    this.yearG = this.barsG
      .selectAll(".year-g")
      .data(this.displayData, (d) => d.year)
      .join((enter) =>
        enter
          .append("g")
          .attr("class", "year-g")
          .attr("transform", (d) => `translate(${this.x(d.year)},0)`)
      );

    this.yearG
      .selectAll(".bar-rect")
      .data(
        (d) => d.values,
        (d) => d.name
      )
      .join((enter) =>
        enter
          .append("rect")
          .attr("class", (d, i) => `bar-rect series-${i + 1}`)
          .attr("fill", "currentColor")
          .attr("x", -this.barWidth / 2)
          .attr("width", this.barWidth)
      )
      .attr("y", this.zeroLineY)
      .attr("height", 0)
      .attr("rx", this.barBorderRadius);

    this.yearG
      .transition(this.transition)
      .attr("transform", (d) => `translate(${this.x(d.year)},0)`)
      .selectAll(".bar-rect")
      .attr("x", -this.barWidth / 2)
      .attr("y", (d) => this.y(d.barValue))
      .attr("width", this.barWidth)
      .attr("height", (d) => this.zeroLineY - this.y(d.barValue));
  }

  _renderZeroLine() {
    this.zeroLine
      .attr("x1", this.marginLeft)
      .attr("x2", this.width - this.marginRight)
      .attr("transform", `translate(0,${this.zeroLineY})`);
  }

  _entered(event, d) {
    this.tooltip.classed("is-visible", true);
    this._moved(event, d);
  }

  _moved(event, d) {
    const [x] = d3.pointer(event);
    const i = d3.bisectCenter(this.xs, x);
    if (this.iActive === i) return;
    this.iActive = i;
    this._updateActive();
  }

  _updateActive() {
    const dActive = this.displayData[this.iActive];
    this.tooltipBody.html(this._tooltipContent(dActive));
    const target = this.yearG.filter((e) => e === dActive).node();
    this._tooltipPosition(target);

    this._updateTotal();

    this.container.dispatch("datumchange", {
      detail: dActive,
      bubbles: true,
    });
  }

  _left() {
    if (!this.showTotal) this.iActive = null;
    this.tooltip.classed("is-visible", false);
    if (this.iActive) this._updateActive();
  }

  _tooltipPosition(target) {
    const cRect = this.container.node().getBoundingClientRect();
    const tRect = target.getBoundingClientRect();
    const bRect = this.tooltipBody.node().getBoundingClientRect();
    let x = tRect.x + tRect.width / 2 - cRect.x;
    let y = tRect.y - cRect.y - this.tooltipArrowSize - this.tooltipOffset;
    this.tooltipArrow.style("transform", `translate(${x}px,${y}px)`);
    x -= bRect.width / 2;
    if (x < 0) {
      x = 0;
    } else if (x + bRect.width > cRect.width) {
      x = cRect.width - bRect.width;
    }
    this.tooltipBody.style(
      "transform",
      `translate(${x}px,calc(${y}px - 100%))`
    );
  }

  _tooltipContent(d) {
    if (this.isLarge) {
      return `
      <div class="total-row">${d.total.name}: <span>${this.formatValue(
        d.total.value
      )}</span></div>
      ${d.values
        .map(
          (d, i) => `
      <div class="value-row"><div class="swatch series-${i + 1}"></div> ${
            d.name
          }: <span>${this.formatValue(d.value)}</span></div>
      `
        )
        .join("")}
    `;
    } else if (this.showTotal) {
      return `
        <div class="total-row"><span>${this.formatValue(
          d.total.value
        )}</span></div>
      `;
    }
  }

  update() {
    this._wrangle();
    if (this.width) this._render();
  }

  setData(_) {
    this.data = _;
    return this;
  }
  setChartType(_) {
    this.chartType = _;
    return this;
  }
}
