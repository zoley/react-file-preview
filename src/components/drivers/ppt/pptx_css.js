export default `.pptx-wrapper section {
  width: 100%;
  height: 690px;
  position: relative;
  border: 1px solid #333;
  background-color: #EFEFEF;
  text-align: center;
  border-radius: 10px;
  box-shadow: 1px 1px 3px #AAA;
  overflow: hidden;
}

.pptx-wrapper section div.block {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.pptx-wrapper section div.content {
  display: flex;
  flex-direction: column;
  /*
  justify-content: center;
  align-items: flex-end;
  */
}

.pptx-wrapper section div.v-up {
  justify-content: flex-start;
}
.pptx-wrapper section div.v-mid {
  justify-content: center;
}
.pptx-wrapper section div.v-down {
  justify-content: flex-end;
}
.pptx-wrapper section div.h-left {
  align-items: flex-start;
  text-align: left;
}
.pptx-wrapper section div.h-mid {
  align-items: center;
  text-align: center;
}
.pptx-wrapper section div.h-right {
  align-items: flex-end;
  text-align: right;
}
.pptx-wrapper section div.up-left {
  justify-content: flex-start;
  align-items: flex-start;
  text-align: left;
}
.pptx-wrapper section div.up-center {
  justify-content: flex-start;
  align-items: center;
}
.pptx-wrapper section div.up-right {
  justify-content: flex-start;
  align-items: flex-end;
}
.pptx-wrapper section div.center-left {
  justify-content: center;
  align-items: flex-start;
  text-align: left;
}
.pptx-wrapper section div.center-center {
  justify-content: center;
  align-items: center;
}
.pptx-wrapper section div.center-right {
  justify-content: center;
  align-items: flex-end;
}
.pptx-wrapper section div.down-left {
  justify-content: flex-end;
  align-items: flex-start;
  text-align: left;
}
.pptx-wrapper section div.down-center {
  justify-content: flex-end;
  align-items: center;
}
.pptx-wrapper section div.down-right {
  justify-content: flex-end;
  align-items: flex-end;
}

.pptx-wrapper section span.text-block {
  /* display: inline-block; */
}

.pptx-wrapper li.slide {
  margin: 10px 0;
  font-size: 18px;
}

.pptx-wrapper div.footer {
  text-align: center;
}

.pptx-wrapper section table {
  position: absolute;
}

.pptx-wrapper section table, 
.pptx-wrapper section th, 
.pptx-wrapper section td {
  border: 1px solid black;
}

.pptx-wrapper section svg.drawing {
  position: absolute;
  overflow: visible;
}`
